
import * as R from 'ramda'
import { Card, Space, Avatar, Button, Badge, Divider, Tooltip, notification, Typography, Dropdown, Menu } from 'antd';
import { useDispatch } from 'react-redux';
import { useElectronStore } from '../hooks/store';
import { setVisible } from '../redux/drawer'
import { CheckCircleTwoTone, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRPC } from '../hooks/use-rpc';

export default function ProxyCardsSection() {
    const { invoke } = useRPC()

    const dispatch = useDispatch();

    const { proxyNode: { list, current } } = useElectronStore();

    const showDrawer = (uuid: string | null) => {
        const node = list.find(R.propEq('uuid', uuid))
        dispatch(setVisible({ name: 'proxySettings', visible: true, data: node }))
    }

    const trojanRestart = async () => {
        try {
            await invoke('trojanRestart')
            notification.success({ message: '代理服务重启成功' })
        } catch (error) {
            console.log(error)
            notification.error({ message: String(error) })
        }
    }

    return (
        <Card
            title={
                <Space>
                    <Typography.Title level={5} style={{ margin: 0 }}>代理节点</Typography.Title>
                    <Divider type='vertical' />
                    <Tooltip title='新增节点'>
                        <Button size='small' shape='round' icon={<PlusOutlined />} onClick={() => showDrawer(null)}>
                        </Button>
                    </Tooltip>

                    <Tooltip title='重启代理服务'>
                        <Button size='small' shape='round' icon={<ReloadOutlined />} onClick={trojanRestart}>
                        </Button>
                    </Tooltip>
                </Space>
            }
        >
            <Space style={{ flexWrap: 'wrap' }}>
                {list.map(({ uuid, name, type, config }) => (
                    <Dropdown
                        key={uuid}
                        overlay={
                            <Menu items={[{
                                key: uuid,
                                label: '删除',
                                danger: true,
                                onClick: async ({ key }) => {
                                    try {
                                        if (current === key) {
                                            throw new Error('不能删除活跃的节点')
                                        }

                                        await invoke('removeNodeByUUID', key)
                                        await invoke('trayUpdate')
                                        notification.success({ message: '代理服务重启成功' })
                                    }
                                    catch (error) {
                                        console.log(error)
                                        notification.error({ message: String(error) })
                                    }
                                }
                            }]} />
                        }
                        trigger={['contextMenu']}
                    >
                        <Card
                            hoverable
                            bordered
                            style={{ width: '16rem', overflow: 'hidden' }}
                            onClick={() => showDrawer(uuid)}
                        >
                            <Card.Meta
                                avatar={
                                    <Badge
                                        count={uuid === current ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : 0}
                                    >
                                        <Avatar style={{ backgroundColor: '#f56a00' }} shape='square'>{type}</Avatar>
                                    </Badge>
                                }
                                title={
                                    <Space>
                                        <span>{name}</span>
                                    </Space>
                                }
                                description={`${config.remote_addr}:${config.remote_port}`}
                            />
                        </Card>
                    </Dropdown>
                ))}
            </Space>
        </Card>
    )
}
