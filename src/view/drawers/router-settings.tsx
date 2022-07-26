import * as R from 'ramda'
import { useEffect } from 'react'
import { Form, Input, Drawer, Button, Space, Typography, List, notification, Select, Radio, Upload, Mentions } from 'antd'
import { setVisible } from '../redux/drawer'
import { useDispatch } from 'react-redux'
import { useDrawer, useElectronStore } from '../hooks/store'
import { useRPC } from '../hooks/use-rpc'
import { useThrottleCallback, useThrottle } from '@react-hook/throttle'
import { textToRules } from '../util'

const rulePrefixs = ['domain:', 'full:', 'regexp:', 'cidr:', 'geosite:', 'geoip:']

function RouterSettings() {
    const { rpc } = useRPC();

    const [form] = Form.useForm<Record<'proxyText' | 'bypassText' | 'blockText' | 'defaultPolicy' | 'domainStrategy' | 'geosite' | 'geoip', string>>();

    const dispatch = useDispatch();

    const { router } = useDrawer();
    const { visible } = router;

    const { settings } = useElectronStore();
    const { modes } = settings.router;

    const mode = modes[0];

    useEffect(() => {
        if (R.isNil(mode)) return;
        const { bypassText, proxyText, blockText, defaultPolicy, domainStrategy, geoip, geosite } = mode;

        form.setFieldsValue({
            proxyText: proxyText,
            bypassText: bypassText,
            blockText: blockText,
            defaultPolicy: defaultPolicy,
            domainStrategy: domainStrategy,
            geosite: geosite,
            geoip: geoip,
        })
    }, [mode])


    const close = () => {
        dispatch(setVisible({
            name: 'router',
            visible: false
        }))
    }

    const onFinish = async (restart: boolean = false) => {
        if (R.isNil(mode)) return;

        try {
            const values = form.getFieldsValue()

            const proxy = textToRules(values.proxyText)
            const bypass = textToRules(values.bypassText)
            const block = textToRules(values.blockText)

            check([proxy, bypass, block].flat())
            console.log([proxy, bypass, block].flat().join('\n'))

            await rpc.invoke('setRouterModeByName', 'default', R.mergeDeepRight(mode, {
                proxyText: values.proxyText,
                bypassText: values.bypassText,
                blockText: values.blockText,
                defaultPolicy: values.defaultPolicy,
                domainStrategy: values.domainStrategy,
                geosite: values.geosite,
                geoip: values.geoip
            }))

            notification.success({ message: '更改成功' })

            if (restart) {
                await rpc.invoke('trojanRestart');
                notification.success({ message: '代理服务重启成功' })
            }

            close()

        } catch (error) {
            console.log(error)
            notification.error({ message: String(error) })
        }
    }

    const rulesTooltip = (
        <>
            <p>{`domain:  子域名匹配`}</p>
            <p>{`full:    完全域名匹配`}</p>
            <p>{`regexp:  正则表达式匹配`}</p>
            <p>{`cidr:    CIDR匹配`}</p>
            <p>{`geosite: geosite.dat 内置集合`}</p>
            <p>{`geoip:   geoip.dat 内置集合`}</p>
        </>
    )

    return (
        <Drawer
            visible={visible}
            onClose={close}
            placement='right'
            getContainer={false}
            size={'large'}
            closable={false}
            forceRender
            mask
            footer={
                <Space>
                    <Button type="primary" onClick={() => onFinish(false)}>更改</Button>
                    <Button type='primary' danger onClick={() => onFinish(true)}>更改并重载</Button>
                </Space>
            }
        >
            <Form
                form={form}
                layout='vertical'
            >
                <Form.Item name='bypassText' label='直连' tooltip={rulesTooltip}>
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} onChange={
                        useThrottleCallback((e) => {
                            const normativeFlag = '✅';

                            const lines = e.target.value.split('\n').map(line => {
                                if (line.startsWith(normativeFlag)) return line;

                                if (rulePrefixs.some(prefix => line.startsWith(prefix))) {
                                    return normativeFlag + line;
                                }

                                return line;
                            })
                            console.log(lines)
                            // form.setFieldsValue({
                            //     bypassText: lines.join('\n')
                            // })
                        }, 10)} />
                </Form.Item>

                <Form.Item name='proxyText' label='代理' tooltip={rulesTooltip}>
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
                </Form.Item>

                <Form.Item name='blockText' label='阻塞' tooltip={rulesTooltip}>
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
                </Form.Item>

                <Form.Item name='defaultPolicy' label='默认路由策略' tooltip={'路由未匹配时，将使用默认路由策略'}>
                    <Radio.Group options={[
                        { label: '直连', value: 'bypass' },
                        { label: '代理', value: 'proxy' },
                        { label: '阻塞', value: 'block' },
                    ]} />
                </Form.Item>

                <Form.Item name='domainStrategy' label='域名解析策略' tooltip={
                    <>
                        <p>as_is: 只在各列表中的域名规则内进行匹配。</p>
                        <p>ip_if_non_match: 先在各列表中的域名规则内进行匹配；如果不匹配，则解析为IP后，在各列表中的IP地址规则内进行匹配。该策略可能导致DNS泄漏或遭到污染。</p>
                        <p>ip_on_demand: 先解析为IP，在各列表中的IP地址规则内进行匹配；如果不匹配，则在各列表中的域名规则内进行匹配。该策略可能导致DNS泄漏或遭到污染。</p>
                    </>
                }>
                    <Radio.Group options={[
                        // 只在各列表中的域名规则内进行匹配。
                        { label: 'as_is', value: 'as_is' },
                        // 先在各列表中的域名规则内进行匹配；如果不匹配，则解析为IP后，在各列表中的IP地址规则内进行匹配。该策略可能导致DNS泄漏或遭到污染。
                        { label: 'ip_if_non_match', value: 'ip_if_non_match' },
                        // 先解析为IP，在各列表中的IP地址规则内进行匹配；如果不匹配，则在各列表中的域名规则内进行匹配。该策略可能导致DNS泄漏或遭到污染。
                        { label: 'ip_on_demand', value: 'ip_on_demand' },
                    ]} />
                </Form.Item>

                <Form.Item name='geosite' label='geosite' tooltip={'默认使用内置geosite.dat，若修改，请使用绝对路径'}>
                    <Input />
                </Form.Item>

                <Form.Item name='geoip' label='geoip' tooltip={'默认使用内置geoip-only-cn-private.dat，若修改，请使用绝对路径'}>
                    <Input />
                </Form.Item>
            </Form>

        </Drawer >
    )
}


function check(lines: string[]) {
    for (const line of lines) {
        if (rulePrefixs.some(p => line.startsWith(p))) {
            continue;
        }
        throw new Error(line + '缺少前缀' + rulePrefixs)
    }
}




export default RouterSettings;
