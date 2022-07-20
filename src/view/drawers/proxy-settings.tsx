import { ReactNode, useEffect } from 'react'
import { Form, Input, Drawer, Button, Switch, message, Space, FormItemProps, notification } from 'antd'
import * as R from 'ramda'
import { setVisible } from '../redux/drawer'
import { useDispatch } from 'react-redux'
import { useDrawer } from '../hooks/store'
import { useRPC } from '../hooks/use-rpc'

const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 10 },
}

function ProxySettings() {
    const { invoke } = useRPC();

    const [form] = Form.useForm();

    const dispatch = useDispatch();

    const { proxySettings } = useDrawer()
    const { visible, data } = proxySettings;

    const hideDrawer = () => {
        dispatch(setVisible({
            name: 'proxySettings',
            visible: false
        }))
    }

    useEffect(() => {
        if (R.isNil(data)) {
            form.resetFields()
        } else {
            const { name, config } = data;
            const {
                remote_addr,
                remote_port,
                password,
                ssl,
                mux,
                websocket,
                shadowsocks,
            } = config;

            form.setFieldsValue({
                name,
                remote_addr,
                remote_port,
                password: password[0],

                'ssl.sni': ssl.sni,

                'mux.enabled': mux.enabled,

                'websocket.enabled': websocket.enabled,
                'websocket.host': websocket.host,
                'websocket.path': websocket.path,

                'shadowsocks.enabled': shadowsocks.enabled,
                'shadowsocks.method': shadowsocks.method,
                'shadowsocks.password': shadowsocks.password,
            })
        }
    }, [form, data])


    const onFinish = async () => {
        try {
            await form.validateFields()
            const values = form.getFieldsValue();

            const { name, remote_addr, remote_port, password } = values;

            const websocket = {
                enabled: values['websocket.enabled'],
                host: values['websocket.host'],
                path: values['websocket.path'],
            }

            const shadowsocks = {
                enabled: values['shadowsocks.enabled'],
                method: values['shadowsocks.method'],
                password: values['shadowsocks.password'],
            }

            const ssl = {
                sni: values['ssl.sni']
            }

            const mux = {
                enabled: values['mux.enabled']
            }

            const config = {
                remote_addr,
                remote_port: Number(remote_port),
                password: [password],
                ssl,
                mux,
                websocket,
                shadowsocks
            }

            if (R.isNil(data)) {
                // 新增
                const node = {
                    name,
                    config
                }

                await invoke('appendNode', node);
                hideDrawer();
                notification.success({ message: `新增成功` })
            } else {
                // 修改
                const node = R.mergeDeepRight(data, {
                    name,
                    config
                });

                await invoke('setNodeByUUID', node.uuid, node);
                hideDrawer();
                notification.success({ message: '修改成功' })
            }
        }
        catch (error) {
            console.log(error)
            notification.error({ message: String(error) })
        }

    };

    return (
        <Drawer
            visible={visible}
            placement='right'
            getContainer={false}
            size={'large'}
            mask={true}
            closable={false}
            onClose={hideDrawer}
            footer={
                <Space>
                    <Button type="primary" onClick={onFinish}>{R.isNil(data) ? '新增' : '更改'}</Button>
                </Space>
            }
        >

            <Form
                form={form}
                name='proxy-setting'
                labelAlign='right'
                {...formItemLayout}
            >
                {item({
                    label: 'Host',
                    name: 'remote_addr',
                    rules: [{ required: true }]
                }, <Input placeholder={'域名 or IP'} />)}

                {item({
                    label: 'Port',
                    name: 'remote_port',
                    rules: [{ type: 'integer', transform: Number }]
                }, <Input />)}

                {item({
                    label: 'Password',
                    name: 'password',
                    rules: [{ required: true }]
                }, <Input.Password />)}

                {item({ label: 'TLS SNI', name: 'ssl.sni' }, <Input />)}

                {item({ label: '多路复用', name: 'mux.enabled', valuePropName: 'checked' }, <Switch />)}

                {item({ label: 'Web Socket', name: 'websocket.enabled', valuePropName: 'checked' }, <Switch />)}

                {item({ label: 'Host', name: 'websocket.host' }, <Input />)}
                {item({ label: 'Path', name: 'websocket.path' }, <Input />)}

                {item({ label: 'Shadowsocks', name: 'shadowsocks.enabled', valuePropName: 'checked' },
                    <Switch />
                )}

                {item({ label: 'Method', name: 'shadowsocks.method' }, <Input />)}
                {item({ label: 'Password', name: 'shadowsocks.password' }, <Input />)}

                {item({ label: '备注', name: 'name' }, <Input />)}
            </Form>
        </Drawer >
    )
}

function item(
    props: FormItemProps,
    children: ReactNode
) {
    return (
        <Form.Item {...props} >
            {children}
        </Form.Item>
    )
}

export default ProxySettings
