
import * as R from 'ramda'
import { Card, Space, Switch, Divider, Button, notification, Popover, Tag, Badge, TagProps, Typography } from 'antd';
import { useElectronStore } from '../hooks/store';
import { useRPC } from '../hooks/use-rpc';
import { useDispatch } from 'react-redux';
import { setVisible } from '../redux/drawer';
import { textToRules } from '../util';

export default function RouteModeSection() {
    const { rpc } = useRPC();
    const dispatch = useDispatch()

    const { settings } = useElectronStore();
    const { router } = settings;
    const { enabled, modes } = router;
    const mode = modes[0];
    const { bypassText, proxyText, blockText } = mode;

    const handleSwitchClick = async (enabled: boolean) => {
        await rpc.invoke('setRouter', R.assoc('enabled', enabled, router))
        await rpc.invoke('trojanRestart');
        notification.success({ message: '代理服务已重启' });
    }

    const showDrawer = () => {
        dispatch(setVisible({ name: 'router', visible: true }))
    }

    return (
        <Card>
            <Space>
                <Typography.Title level={5} style={{ margin: 0 }}>路由模式</Typography.Title>
                <Switch checked={enabled} onClick={handleSwitchClick} />
                <Divider type='vertical'></Divider>
                {
                    tag(bypassText, '直连', 'default')
                }
                {
                    tag(proxyText, '代理', 'green')
                }
                {
                    tag(blockText, '阻塞', 'red')
                }

                <Button type='link' onClick={showDrawer}>编辑</Button>

                <Divider type='vertical'></Divider>
                <Typography.Text type='secondary'>
                    开启路由模式后建议关闭PAC代理
                </Typography.Text>
            </Space>
        </Card>
    )
}

function tag(data: string, label: string, color: TagProps['color']) {
    const lines = textToRules(data)
    return (
        <Popover
            title={
                <Tag color={color}>{label}</Tag>
            }
            content={
                <div>
                    {lines.map((i, index) => <p key={index}>{i}</p>)}
                </div>
            }
        >
            <Badge count={lines.length} showZero size='small' offset={[-8, 0]} color='cyan'>
                <Tag color={color}>{label}</Tag>
            </Badge>
        </Popover>
    )
}