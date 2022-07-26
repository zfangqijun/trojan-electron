
import * as R from 'ramda'
import { Card, Space, Typography, Switch, Divider, Checkbox, CheckboxProps, notification } from 'antd';
import { useElectronStore } from '../hooks/store';
import { useRPC } from '../hooks/use-rpc';

export default function SystemProxySection() {
    const { rpc } = useRPC();

    const { systemProxy } = useElectronStore();
    const { enable, web, secureWeb, socks } = systemProxy;

    const handleCheckboxClick: CheckboxProps['onChange'] = async (e) => {
        try {
            const name = e.target.value;
            const currentEnableValue = R.path([name, 'enable'], systemProxy);
            const newEnableValue = !currentEnableValue;

            await rpc.invoke('setSystemProxyByName', name, { enable: newEnableValue })
            await rpc.invoke('enableSystemProxy', name, newEnableValue)
            await rpc.invoke('trayUpdate');

            notification.success({ message: newEnableValue })

        } catch (error) {
            notification.error({ message: String(error) })
        }

    }

    const handleSwitchClick = async (enable: boolean) => {
        try {
            await invoke('setSystemProxyEnable', enable)
            if (enable) {
                await invoke('enableSystemProxys')
                notification.success({ message: '系统代理打开' })
            } else {
                await invoke('disableSystemProxys')
                notification.info({ message: '系统代理关闭' })
            }
            await invoke('trayUpdate');

        } catch (error) {
            notification.error({ message: String(error) })
        }
    }

    return (
        <Card>
            <Space>
                <Typography.Title level={5} style={{ margin: 0 }}>系统代理</Typography.Title>

                <Switch checked={enable} onClick={handleSwitchClick} />

                <Divider type='vertical'></Divider>

                <Space>
                    <Checkbox value={'web'} checked={web.enable} onChange={handleCheckboxClick}></Checkbox>
                    <span>HTTP</span>
                    <Checkbox value={'secureWeb'} checked={secureWeb.enable} onChange={handleCheckboxClick}></Checkbox>
                    <span>HTTPS</span>
                    <Checkbox value={'socks'} checked={socks.enable} onChange={handleCheckboxClick}></Checkbox>
                    <span>Socks</span>
                </Space>

                <Divider type='vertical'></Divider>
                <Typography.Text type='secondary'>
                    将在系统的网络设置里开启代理
                </Typography.Text>
            </Space>
        </Card>
    )
}