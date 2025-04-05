import {
	CommentOutlined,
	EllipsisOutlined,
	FireOutlined,
	HeartOutlined,
	ReadOutlined,
	ShareAltOutlined,
	SmileOutlined,
} from '@ant-design/icons'
import { Prompts, Welcome } from '@ant-design/x'
import { IGetAppParametersResponse } from '@dify-chat/api'
import { useIsMobile } from '@dify-chat/helpers'
import { Button, GetProp, Space } from 'antd'
import { useMemo } from 'react'
import logoImage from '../../../../src/assets/images/logo.png'

const renderTitle = (icon: React.ReactElement, title: string) => (
	<Space align="start">
		{icon}
		<span>{title}</span>
	</Space>
)

interface IWelcomePlaceholderProps {
	/**
	 * 应用参数
	 */
	appParameters?: IGetAppParametersResponse
	/**
	 * 点击提示项时触发的回调函数
	 */
	onPromptItemClick: GetProp<typeof Prompts, 'onItemClick'>
}

/**
 * 对话内容区的欢迎占位符
 */
export const WelcomePlaceholder = (props: IWelcomePlaceholderProps) => {
	const { onPromptItemClick, appParameters } = props
	const isMobile = useIsMobile()

	const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = useMemo(() => {
		const DefaultPlaceholderPromptsItems = [
			{
				key: '1',
				label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, 'Hot Topics'),
				description: 'What are you interested in?',
				children: [
					{
						key: '1-1',
						description: `What's new in X?`,
					},
					{
						key: '1-2',
						description: `What's AGI?`,
					},
					{
						key: '1-3',
						description: `Where is the doc?`,
					},
				],
			},
			{
				key: '2',
				label: renderTitle(<ReadOutlined style={{ color: '#1890FF' }} />, 'Design Guide'),
				description: 'How to design a good product?',
				children: [
					{
						key: '2-1',
						icon: <HeartOutlined />,
						description: `Know the well`,
					},
					{
						key: '2-2',
						icon: <SmileOutlined />,
						description: `Set the AI role`,
					},
					{
						key: '2-3',
						icon: <CommentOutlined />,
						description: `Express the feeling`,
					},
				],
			},
		]
		if (appParameters?.suggested_questions) {
			return [
				{
					key: 'remote',
					label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, 'Hot Topics'),
					description: 'What are you interested in?',
					children: appParameters.suggested_questions.map(item => {
						return {
							key: 'remote',
							description: item,
						}
					}),
				},
			]
		}
		if (isMobile) {
			return DefaultPlaceholderPromptsItems.slice(0, 1)
		}
		return DefaultPlaceholderPromptsItems
	}, [isMobile])

	return (
		<div className="flex justify-center w-full px-3 box-border mx-auto">
			<Space
				direction="vertical"
				className="pt-8 w-full md:!w-3/4"
			>
				<Welcome
					variant="borderless"
					icon={logoImage}
					title={appParameters?.opening_statement || "Hello, I'm Dify Chat"}
					description="Base on Dify API, Dify Chat is a web app that can interact with AI."
					extra={
						<Space>
							<Button icon={<ShareAltOutlined />} />
							<Button icon={<EllipsisOutlined />} />
						</Space>
					}
				/>
				<Prompts
					title="Do you want?"
					vertical={isMobile}
					items={placeholderPromptsItems}
					styles={{
						list: {
							width: '100%',
						},
						item: isMobile
							? {
									width: '100%',
								}
							: {
									flex: 1,
								},
					}}
					onItemClick={onPromptItemClick}
				/>
			</Space>
		</div>
	)
}
