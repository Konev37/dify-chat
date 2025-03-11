import XRequest from './base-request';
import { getVars } from '@dify-chat/helpers';
import { IAgentThought } from './types';

interface IUserInputForm {
  'text-input': {
    default: string;
    label: string;
    required: boolean;
    variable: string;
  };
}

/**
 * 获取应用参数-响应体
 */
export interface IGetAppParametersResponse {
  user_input_form: IUserInputForm[];
  suggested_questions_after_answer: {
    enabled: boolean;
  };
}

interface IConversationItem {
  created_at: number;
  id: string;
  inputs: Record<string, string>;
  introduction: string;
  name: string;
  status: 'normal';
  updated_at: number;
}

/**
 * 获取会话列表-参数
 */
interface IGetConversationListRequest {
  /**
   * 返回条数
   */
  limit: number;
}

/**
 * 获取会话列表-响应体
 */
interface IGetConversationListResponse {
  data: IConversationItem[];
}

/**
 * 知识库引用对象
 */
export interface IRetrieverResource {
  id: string;
  message_id: string;
  position: number;
  dataset_id: string;
  dataset_name: string;
  document_id: string;
  document_name: string;
  data_source_type: string;
  segment_id: string;
  score: number;
  hit_count: number;
  word_count: number;
  segment_position: number;
  index_node_hash: null;
  content: string;
  created_at: number;
}

/**
 * 会话历史 Item 结构
 */
interface IMessageItem {
  id: string;
  conversation_id: string;
  inputs: Record<string, string>;
  query: string;
  answer: string;
  message_files: [];
  feedback?: {
    rating: 'like' | 'dislike';
  };
	status: 'normal' | 'error'
	error: string | null
	agent_thoughts?: IAgentThought[]
  /**
   * 知识库引用列表
   */
  retriever_resources?: IRetrieverResource[];
}

interface IGetConversationHistoryResponse {
  data: IMessageItem[];
}

export interface IDifyApiOptions {
  /**
   * 用户
   */
  user: string;
}

export interface IGetAppInfoResponse {
  name: string;
  description: string;
  tags: string[];
}

export interface IGetAppMetaResponse {
  tool_icons: {
    dalle2: string;
    api_tool: {
      background: string;
      content: string;
    };
  };
}

export interface IFileBase {
  /**
   * 支持类型：图片 image（目前仅支持图片格式）
   */
  type: 'image';
}

export interface IFileRemote extends IFileBase  {
  /**
   * 支持类型：图片 image（目前仅支持图片格式）
   */
  type: 'image';
  /**
   * 传递方式 remote_url-远程地址 local_file-本地文件
   */
  transfer_method: 'remote_url';
  /**
   * 图片地址（仅当传递方式为 remote_url 时）
   */
  url?: string
}

export interface IFileLocal extends IFileBase  {
  /**
   * 传递方式 remote_url-远程地址 local_file-本地文件
   */
  transfer_method:'local_file';
  /**
   * 上传文件 ID（仅当传递方式为 local_file 时）
   */
  upload_file_id?: string
}

export type IFile = IFileRemote | IFileLocal;

/**
 * Dify API 类
 */
export class DifyApi {
  constructor(options: IDifyApiOptions) {
    this.options = options;
    const runtimeVars = getVars();
    this.baseRequest = new XRequest({
      baseURL:
        process.env.NODE_ENV === 'development'
          ? runtimeVars.DIFY_API_VERSION
          : `${runtimeVars.DIFY_API_BASE || ''}${runtimeVars.DIFY_API_VERSION}`,
      apiKey: runtimeVars.DIFY_API_KEY,
    });
  }

  options: IDifyApiOptions;
  baseRequest: XRequest;

  /**
   * 获取应用基本信息
   */
  async getAppInfo() {
    return this.baseRequest.get('/info') as Promise<IGetAppInfoResponse>
  }

  /**
   * 获取应用 Meta 信息
   */
  async getAppMeta() {
    return this.baseRequest.get('/meta') as Promise<IGetAppMetaResponse>;
  }

  /**
   * 获取应用参数
   */
  getAppParameters = () => {
    return this.baseRequest.get('/parameters') as Promise<IGetAppParametersResponse>;
  };

  /**
   * 获取当前用户的会话列表（默认返回最近20条）
   */
  getConversationList(
    params?: IGetConversationListRequest,
  ) {
    return this.baseRequest.get('/conversations', {
      user: this.options.user,
      limit: (params?.limit || 100).toString(),
    }) as Promise<IGetConversationListResponse>
  }

  /**
   * 会话重命名
   */
  renameConversation = (params: {
    /**
     * 会话 ID
     */
    conversation_id: string;
    /**
     * 名称，若 auto_generate 为 true 时，该参数可不传。
     */
    name?: string;
    /**
     * 自动生成标题，默认 false
     */
    auto_generate?: boolean;
  }) => {
    const { conversation_id, ...restParams } = params;
    return this.baseRequest.post(`/conversations/${conversation_id}/name`, {
      ...restParams,
      user: this.options.user,
    });
  };

  /**
   * 删除会话
   */
  deleteConversation = (conversation_id: string) => {
    return this.baseRequest.delete(`/conversations/${conversation_id}`, {
      user: this.options.user,
    });
  };

  /**
   * 获取会话历史消息
   */
  getConversationHistory = (
    conversation_id: string,
  ) => {
    return this.baseRequest.get(`/messages`, {
      user: this.options.user,
      conversation_id,
    }) as Promise<IGetConversationHistoryResponse>
  };

  /**
   * 发送对话消息
   */
  sendMessage(params: {
    /**
     * 对话 ID
     */
    conversation_id?: string;
    /**
     * 输入参数
     */
    inputs: Record<string, string>;
    /**
     * 附件
     */
    files: IFile[];
    /**
     * 用户
     */
    user: string;
    /**
     * 响应模式
     */
    response_mode: 'streaming';
    /**
     * 问题
     */
    query: string;
  }) {
    return this.baseRequest.baseRequest('/chat-messages', {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', this.options.user);
    return this.baseRequest.baseRequest('/files/upload', {
      method: 'POST',
      body: formData,
    }).then(res=>res.json())
  }

  /**
   * 获取下一轮建议问题列表
   */
  async getNextSuggestions(params: {
    /**
     * 消息 ID
     */
    message_id: string;
  }) {
    return this.baseRequest.get(`/messages/${params.message_id}/suggested`, {
      user: this.options.user,
    });
  }

  /**
   * 消息反馈
   */
  feedbackMessage(params: {
    /**
     * 消息 ID
     */
    messageId: string;
    /**
     * 反馈类型 like-点赞 dislike-点踩 null-取消
     */
    rating: 'like' | 'dislike' | null;
    /**
     * 反馈内容
     */
    content: string;
  }) {
    const { messageId, ...restParams } = params;
    return this.baseRequest.post(`/messages/${messageId}/feedbacks`, {
      ...restParams,
      user: this.options.user,
    });
  }
}

/**
 * 创建 Dify API 实例
 */
export const createDifyApiInstance = (options: IDifyApiOptions) => {
  return new DifyApi(options);
};