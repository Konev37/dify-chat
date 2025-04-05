import { RobotOutlined, UserOutlined } from '@ant-design/icons'
import { Bubble, Prompts } from '@ant-design/x'
import { DifyApi, IFile, IGetAppParametersResponse, IMessageItem4Render } from '@dify-chat/api'
import { IDifyAppItem } from '@dify-chat/core'
import { isTempId, useIsMobile } from '@dify-chat/helpers'
import { GetProp } from 'antd'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

import { MessageSender } from '../message-sender'
import MessageContent from './message/content'
import MessageFooter from './message/footer'
import { WelcomePlaceholder } from './welcome-placeholder'

export interface ChatboxProps {
	/**
	 * 应用参数
	 */
	appParameters?: IGetAppParametersResponse
	/**
	 * 应用配置
	 */
	appConfig: IDifyAppItem
	/**
	 * 消息列表
	 */
	messageItems: IMessageItem4Render[]
	/**
	 * 是否正在请求
	 */
	isRequesting: boolean
	/**
	 * 下一步问题建议
	 */
	nextSuggestions: string[]
	/**
	 * 推荐 Item 点击事件
	 */
	onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'>
	/**
	 * 内容提交事件
	 * @param value 问题-文本
	 * @param files 问题-文件
	 */
	onSubmit: (
		value: string,
		options?: {
			files?: IFile[]
			inputs?: Record<string, unknown>
		},
	) => void
	/**
	 * 取消读取流
	 */
	onCancel: () => void
	/**
	 * 对话 ID
	 */
	conversationId: string
	/**
	 * 反馈执行成功后的回调
	 */
	feedbackCallback?: (conversationId: string) => void
	/**
	 * Dify API 实例
	 */
	difyApi: DifyApi
	/**
	 * 反馈 API
	 */
	feedbackApi: DifyApi['feedbackMessage']
	/**
	 * 上传文件 API
	 */
	uploadFileApi: DifyApi['uploadFile']

	renderMessage: any
}

/**
 * 对话内容区
 */
export const Chatbox = (props: ChatboxProps) => {
	const {
		messageItems,
		isRequesting,
		nextSuggestions,
		onPromptsItemClick,
		onSubmit,
		onCancel,
		conversationId,
		feedbackCallback,
		difyApi,
		appParameters,
		appConfig,
	} = props
	const [content, setContent] = useState('')
	const isMobile = useIsMobile()

	const roles: GetProp<typeof Bubble.List, 'roles'> = {
		ai: {
			placement: 'start',
			avatar: !isMobile ? { icon: <RobotOutlined />, style: { background: '#fde3cf' } } : undefined,
			style: isMobile
				? undefined
				: {
						// 减去一个头像的宽度
						maxWidth: 'calc(100% - 44px)',
					},
		},
		user: {
			placement: 'end',
			avatar: !isMobile
				? {
						icon: <UserOutlined />,
						style: {
							background: '#87d068',
						},
					}
				: undefined,
			style: isMobile
				? undefined
				: {
						// 减去一个头像的宽度
						maxWidth: 'calc(100% - 44px)',
						marginLeft: '44px',
					},
		},
	}

	const items: GetProp<typeof Bubble.List, 'items'> = useMemo(() => {
		return messageItems?.map(messageItem => {
			return {
				key: `${messageItem.id}-${messageItem.role}`,
				// 不要开启 loading 和 typing, 否则流式会无效
				// loading: status === 'loading',
				content: messageItem.content,
				messageRender: () => {
					return (
						<MessageContent
							appConfig={appConfig}
							onSubmit={onSubmit}
							messageItem={messageItem}
						/>
					)
				},
				// 用户发送消息时，status 为 local，需要展示为用户头像
				role: messageItem.role === 'local' ? 'user' : messageItem.role,
				footer: messageItem.role === 'ai' && (
					<div className="flex items-center">
						<MessageFooter
							feedbackApi={params => difyApi.feedbackMessage(params)}
							messageId={messageItem.id}
							messageContent={messageItem.content}
							feedback={{
								rating: messageItem.feedback?.rating,
								callback: () => {
									feedbackCallback?.(conversationId!)
								},
							}}
						/>
						{messageItem.created_at && (
							<div className="ml-3 text-sm text-desc">回复时间：{messageItem.created_at}</div>
						)}
					</div>
				),
			}
		}) as GetProp<typeof Bubble.List, 'items'>
	}, [messageItems, conversationId, difyApi, feedbackCallback, appConfig, onSubmit])

	// 监听 items 更新，滚动到最底部
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	// 延迟更新，优化性能
	const deferredItems = useDeferredValue(items)
	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTo({
				behavior: 'smooth',
				top: scrollContainerRef.current.scrollHeight,
			})
		}
	}, [deferredItems])

	return (
		<div className="w-full h-full overflow-hidden my-0 mx-auto box-border flex flex-col gap-4 relative bg-white">
			<div
				className="w-full h-full overflow-auto pt-4 pb-48"
				ref={scrollContainerRef}
			>
				{/* 🌟 欢迎占位 */}
				{!items?.length && isTempId(conversationId) && (
					<WelcomePlaceholder
						appParameters={appParameters}
						onPromptItemClick={onPromptsItemClick}
					/>
				)}
				{/* 🌟 消息列表 */}
				<Bubble.List
					items={items}
					roles={roles}
					className="flex-1 w-full md:!w-3/4 mx-auto px-3 md:px-0 box-border"
				/>
				<div
					className="absolute bottom-0 bg-white w-full md:!w-3/4 left-1/2"
					style={{
						transform: 'translateX(-50%)',
					}}
				>
					{/* 🌟 提示词 */}
					<Prompts
						className="text-default p-3 bg-transparent"
						items={nextSuggestions?.map((item, index) => {
							return {
								key: index.toString(),
								description: item,
							}
						})}
						onItemClick={onPromptsItemClick}
					/>
					{/* 🌟 输入框 */}
					<div className="px-3">
						<MessageSender
							appParameters={appParameters}
							content={content}
							onChange={value => setContent(value)}
							onSubmit={(content, options) => {
								if (!content) {
									return
								}
								onSubmit(content, options)
								setContent('')
							}}
							isRequesting={isRequesting}
							className="w-full"
							uploadFileApi={(...params) => {
								return difyApi.uploadFile(...params)
							}}
							onCancel={onCancel}
						/>
					</div>
					<div className="text-gray-400 text-sm text-center h-8 leading-8">
						内容由 AI 生成, 仅供参考
					</div>
				</div>
			</div>
		</div>
	)
}
