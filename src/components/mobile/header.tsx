import { Link } from 'pure-react-router'

import { GithubIcon, LogoIcon } from '@/components/logo'

interface IMobileHeaderProps {
	/**
	 * 自定义中间部分内容
	 */
	centerChildren: JSX.Element
}

/**
 * 移动端共用头部
 */
export const MobileHeader = (props: IMobileHeaderProps) => {
	const { centerChildren } = props

	return (
		<div className="h-12 !leading-[3rem] px-4 text-base top-0 z-20 bg-white w-full shadow-sm font-semibold justify-between flex items-center box-border">
			<Link
				to="/apps"
				className="flex items-center"
			>
				<LogoIcon />
			</Link>

			<div className="flex-1 overflow-hidden flex items-center justify-center">
				{centerChildren}
			</div>

			{/*<GithubIcon />*/}
		</div>
	)
}
