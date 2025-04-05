import { DifyChatProvider } from '@dify-chat/core'
import { initResponsiveConfig } from '@dify-chat/helpers'
import { BrowserRouter, type IRoute, Route } from 'pure-react-router'

import { USER } from './config'
import AppListPage from './pages/app-list'
import ChatPage from './pages/chat'
import DifyAppService from './services/app/localstorage'

// 初始化响应式配置
initResponsiveConfig()

const routes: IRoute[] = [
	{ path: '/chat', component: () => <ChatPage /> },
	{ path: '/apps', component: () => <AppListPage /> },
	{ path: '/', component: () => <ChatPage /> },
]

/**
 * Dify Chat 的最小应用实例
 */
export default function App() {
	return (
		<BrowserRouter
			basename="/dify-chat"
			routes={routes}
		>
			<DifyChatProvider
				// value={{
				// 	mode: 'multiApp',
				// 	user: USER,
				// 	// 默认使用 localstorage, 如果需要使用其他存储方式，可以实现 DifyAppStore 接口后传入，异步接口实现参考 src/services/app/restful.ts
				// 	appService: new DifyAppService(),
				// }}

				value={{
					// 修改为单应用模式
					mode: 'singleApp',
					// 用户id，可以获取业务系统的用户 ID，动态传入
					user: USER,
					// 单应用模式下，需要传入 appConfig 配置
					appConfig: {
						requestConfig: {
							apiBase: 'http://8.138.97.137/v1',
							apiKey: 'app-xSUkL51RzJduDARYbVZ16yTX',
						},
					},
				}}
			>
				<Route />
			</DifyChatProvider>
		</BrowserRouter>
	)
}
