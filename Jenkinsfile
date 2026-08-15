pipeline {
    // 在Jenkins流水线中，agent指令用于指定整个流水线或特定阶段在哪个节点上执行。agent any的意思是允许流水线在任何可用的代理（agent）上执行。
    agent any

    tools {
        nodejs 'nodejs-24'
    }

    environment {
        // ============================================
        // 镜像仓库配置
        // ============================================
        DOCKER_REGISTRY = 'crpi-56q1ufb8a15io44o.cn-shenzhen.personal.cr.aliyuncs.com'
        DOCKER_NAMESPACE = 'wa-docker'
        IMAGE_NAME = 'vue-pure-admin'

        // 版本号策略：使用 Git commit hash 或 Jenkins build number
        IMAGE_TAG = "${env.GIT_COMMIT?.take(8) ?: env.BUILD_NUMBER}"

        // ============================================
        // 部署服务器配置
        // ============================================
        // DEPLOY_SERVER = '43.138.196.58'
        DEPLOY_SERVER = 'localhost'
        // 用户名，后面需要改，权限太大
        DEPLOY_USER = 'root'
        CONTAINER_NAME = 'vue-pure-admin'
        CONTAINER_PORT = '5000'

        // ============================================
        // 其他配置
        // ============================================
        // 保留的镜像版本数量
        KEEP_IMAGES = 5
    }

    // 参数化构建（可选）
    parameters {
        // 下拉框 参数化构建
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'test', 'prod'],
            description: '部署环境'
        )
        // 复选框 参数化构建
        booleanParam(
            name: 'SKIP_ESLINT',
            defaultValue: false,
            description: '是否跳过ESLINT校验'
        )
        // 是否跳过构建，直接从拉取镜像开始
        booleanParam(
            name: 'SKIP_TO_PULL_IMAGE',
            defaultValue: false,
            description: '直接跳到拉取镜像'
        )
    }

    stages {
        stage('诊断用户') {
            steps {
                script {
                    // 这些命令会在Pipeline执行的Shell中运行
                    sh '''
                        echo "1. 当前Shell用户是: $(whoami)"
                        echo "2. 用户ID是: $(id -u)"
                        echo "3. 用户名是: $(id -un)"
                        echo "4. 所属组是: $(groups)"
                        echo "5. Docker套接字权限:"
                        ls -la /var/run/docker.sock || echo "套接字不存在"
                    '''
                }
            }
        }
        stage('代码检出') {
            when {
                expression { !params.SKIP_TO_PULL_IMAGE }
            }
            steps {
              // 代码检出，scm 表示源代码管理，checkout 表示检出代码
              // scm 代表了在 Jenkins 任务配置中定义的源代码管理（Source Code Management）设置。
              // 当你在 Jenkins 任务中配置了 SCM 后，Jenkins 会将这些配置信息存储在任务的 scm 变量中。在流水线中执行 checkout scm 时，实际上就是执行了对应 SCM 的检出操作。
              // 对于 Git，它相当于执行了 git clone（或 git fetch）和 git checkout 命令。
              checkout scm
              // script 表示脚本，用于执行一些操作
              script {
                    echo "======================================"
                    echo "开始构建 Vue Pure Admin"
                    echo "分支: ${env.GIT_BRANCH}"
                    echo "提交: ${env.GIT_COMMIT}"
                    echo "版本: ${IMAGE_TAG}"
                    echo "环境: ${params.ENVIRONMENT}"
                    echo "======================================"
                }
            }
        }

        stage('代码检查') {
            when {
                allOf {
                    expression { !params.SKIP_ESLINT }
                    expression { !params.SKIP_TO_PULL_IMAGE }
                }

            }
            steps {
                script {
                    echo "执行eslint校验..."
                    // 如果需要，可以添加 ESLint 检查
                    sh 'npm run lint'
                }
            }
        }

        stage('构建 Docker 镜像') {
            when {
                expression { !params.SKIP_TO_PULL_IMAGE }
            }
            steps {
                script {
                    echo "🏗️  开始构建 Docker 镜像..."

                    // ‘-纯文本字符串  ”-插值字符串类似`, """ 是 groovy 语言中的字符串模板 多行插值
                    // 1. 构建镜像并获取镜像对象
                    def customImage = docker.build(
                        "${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}",
                        // 关键修改：将多行字符串改为一个干净的单行字符串
                        "--no-cache --pull --build-arg NODE_ENV=${params.ENVIRONMENT} --build-arg VERSION=${IMAGE_TAG} --build-arg BUILD_DATE=\"${new Date().format('yyyy-MM-dd HH:mm:ss')}\" ."
                    )

                    echo "✅ 镜像构建完成: ${customImage.id}"

                    // 2. 使用镜像对象打标签（更优雅的方式）
                    customImage.tag('latest')

                    // 3. 打上环境标签
                    if (params.ENVIRONMENT) {
                        customImage.tag(params.ENVIRONMENT)
                    }

                    // 4. 验证镜像
                    sh """
                        echo "📦 镜像信息："
                        docker images | grep "${IMAGE_NAME}"

                        echo "📊 镜像详情："
                        docker inspect ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} | \
                            grep -E 'Size|Created|Architecture|Os'
                    """
                }
            }
        }

        // stage('镜像安全扫描') {
        //     when {
        //         expression { params.ENVIRONMENT == 'prod' }
        //     }
        //     steps {
        //         script {
        //             echo "执行镜像安全扫描..."
        //             // 可以集成 Trivy 或其他安全扫描工具
        //             // sh "trivy image ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"
        //         }
        //     }
        // }

        stage('推送镜像到仓库') {
            when {
                expression { !params.SKIP_TO_PULL_IMAGE }
            }
            steps {
                script {
                    echo "推送镜像到仓库..."
                    // 使用 Jenkins 凭据登录镜像仓库，docker-credentials-id 是 Jenkins 凭据的 ID
                    docker.withRegistry("https://${DOCKER_REGISTRY}", '31a087db-b68e-496d-be8f-3566bb2605aa') {
                        // 推送版本标签，${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} 是镜像的地址
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}").push()

                        // 推送 latest 标签
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:latest").push()

                        // 推送环境标签
                        //if (params.ENVIRONMENT) {
                        //    docker.image("${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:${params.ENVIRONMENT}").push()
                        //}
                    }
                    echo "镜像推送成功！"
                }
            }
        }

        // stage('部署到服务器') {
        //     steps {
        //         script {
        //             echo "开始部署到 ${DEPLOY_SERVER}..."

        //             // 使用 SSH 连接到部署服务器
        //             sshagent(['31a087db-b68e-496d-be8f-3566bb2605aa']) {
        //                 sh """
        //                     ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER} '
        //                         # 颜色输出
        //                         GREEN="\033[0;32m"
        //                         YELLOW="\033[1;33m"
        //                         NC="\033[0m"

        //                         echo "\${GREEN}[1/5] 拉取新镜像...\${NC}"
        //                         docker pull ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:latest

        //                         echo "\${GREEN}[2/5] 停止旧容器...\${NC}"
        //                         docker stop ${CONTAINER_NAME} 2>/dev/null || true

        //                         echo "\${GREEN}[3/5] 删除旧容器...\${NC}"
        //                         docker rm ${CONTAINER_NAME} 2>/dev/null || true

        //                         echo "\${GREEN}[4/5] 启动新容器...\${NC}"
        //                         docker run -d \\
        //                             --name ${CONTAINER_NAME} \\
        //                             -p ${CONTAINER_PORT}:80 \\
        //                             --restart unless-stopped \\
        //                             --log-driver json-file \\
        //                             --log-opt max-size=10m \\
        //                             --log-opt max-file=3 \\
        //                             -e TZ=Asia/Shanghai \\
        //                             ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:latest

        //                         echo "\${GREEN}[5/5] 清理旧镜像...\${NC}"
        //                         docker image prune -f

        //                         # 保留最近 N 个版本的镜像
        //                         docker images ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME} \\
        //                             --format "{{.ID}} {{.Tag}}" | \\
        //                             grep -v "latest\\|${params.ENVIRONMENT}" | \\
        //                             tail -n +${KEEP_IMAGES} | \\
        //                             awk "{print \\\$1}" | \\
        //                             xargs -r docker rmi 2>/dev/null || true

        //                         echo "\${GREEN}部署完成！\${NC}"
        //                     '
        //                 """
        //             }
        //         }
        //     }
        // }

         stage('部署到本机') {
            steps {
                script {
                    echo "🚀 开始部署到本机..."

                    // 检查端口是否被占用
                    sh """
                        echo "检查端口 ${CONTAINER_PORT} 占用情况..."
                        netstat -tlnp | grep :${CONTAINER_PORT} || echo "端口 ${CONTAINER_PORT} 可用"
                    """

                    // 拉取新镜像
                    docker.withRegistry("https://${DOCKER_REGISTRY}", '31a087db-b68e-496d-be8f-3566bb2605aa') {
                      sh """
                          echo "拉取新镜像..."
                          docker pull ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:latest
                      """
                    }

                    // 给镜像打一个简短的本地标签
                    sh """
                        echo "为镜像创建本地标签..."
                        docker tag ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${IMAGE_NAME}:latest ${IMAGE_NAME}:latest
                        echo "✅ 本地镜像标签: ${IMAGE_NAME}:latest"
                    """

                    // 停止并清理旧容器
                    sh """
                        echo "清理旧容器..."
                        docker stop ${CONTAINER_NAME} 2>/dev/null || echo "无旧容器可停止"
                        docker rm ${CONTAINER_NAME} 2>/dev/null || echo "无旧容器可删除"

                        # 清理 dangling 镜像
                        docker image prune -f
                    """

                    // 启动新容器
                    sh """
                        echo "启动新容器..."
                        docker run -d \\
                            --name ${CONTAINER_NAME} \\
                            -p ${CONTAINER_PORT}:5000 \\
                            --restart unless-stopped \\
                            --log-opt max-size=10m \\
                            --log-opt max-file=3 \\
                            -e NODE_ENV=${params.ENVIRONMENT} \\
                            -e VERSION=${IMAGE_TAG} \\
                            -e TZ=Asia/Shanghai \\
                            ${IMAGE_NAME}:latest

                        echo "✅ 容器已启动"
                    """

                    // 验证部署
                    sh """
                        echo "等待容器启动..."
                        sleep 5

                        echo "容器状态："
                        docker ps | grep ${CONTAINER_NAME}

                        echo "容器日志（最后10行）："
                        docker logs --tail 10 ${CONTAINER_NAME}

                        echo "测试服务可达性："
                        curl -f http://localhost:${CONTAINER_PORT} || echo "服务测试失败"
                    """
                }
            }
        }

        stage('健康检查') {
            steps {
                script {
                    echo "等待服务启动..."
                    sleep 10

                    echo "执行健康检查..."
                    def healthCheckPassed = false
                    def maxRetries = 5

                    for (int i = 1; i <= maxRetries; i++) {
                        try {
                            sh """
                                curl -f http://${DEPLOY_SERVER}:${CONTAINER_PORT}/health
                            """
                            healthCheckPassed = true
                            echo "✅ 健康检查通过（第 ${i} 次尝试）"
                            break
                        } catch (Exception e) {
                            echo "⚠️  健康检查失败（第 ${i} 次尝试）"
                            if (i < maxRetries) {
                                sleep 5
                            }
                        }
                    }

                    if (!healthCheckPassed) {
                        error("❌ 健康检查失败，部署可能存在问题！")
                    }
                }
            }
        }

        stage('验证部署') {
            steps {
                script {
                    sshagent(['ssh-credentials-id']) {
                        def containerStatus = sh(
                            script: """
                                ssh ${DEPLOY_USER}@${DEPLOY_SERVER} \
                                    'docker ps -f name=${CONTAINER_NAME} --format "{{.Status}}"'
                            """,
                            returnStdout: true
                        ).trim()

                        echo "容器状态: ${containerStatus}"

                        if (!containerStatus.contains("Up")) {
                            error("容器未正常运行！")
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                echo """
                ====================================
                ✅ 部署成功！
                ====================================
                版本: ${IMAGE_TAG}
                环境: ${params.ENVIRONMENT}
                访问地址: http://${DEPLOY_SERVER}:${CONTAINER_PORT}
                ====================================
                """

                // 发送成功通知（钉钉、企业微信、邮件等）
                // dingTalk(...)
            }
        }

        failure {
            script {
                echo """
                ====================================
                ❌ 部署失败！
                ====================================
                版本: ${IMAGE_TAG}
                环境: ${params.ENVIRONMENT}
                请检查日志并进行回滚。
                ====================================
                """

                // 发送失败通知
                // dingTalk(...)

                // 可以自动触发回滚
                // build job: 'vue-pure-admin-rollback', parameters: [...]
            }
        }

        always {
            // 清理工作空间
            cleanWs()
        }
    }
}
