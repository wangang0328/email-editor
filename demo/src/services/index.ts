import './axios.config';
import { common } from '@demo/services/common';
import { article } from './article';
import { user } from './user';
import { ai, conversations } from './ai';

const services = {
  common,
  article,
  user,
  ai,
  conversations,
};

export default services;
