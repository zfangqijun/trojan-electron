
import { Card, Row, Col, Statistic, Button } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useRPC } from '../hooks/use-rpc'
import * as R from 'ramda'

export default function StatisticSection() {
    const { invoke } = useRPC();

    const [traffic, setTraffic] = useState<any>()

    const downloadSpeed = R.pathOr(0, ['speedCurrent', 'downloadSpeed', 'low'], traffic) / 1024;

    const uploadSpeed = R.pathOr(0, ['speedCurrent', 'uploadSpeed', 'low'], traffic) / 1024;

    const downloadSpeedString = [downloadSpeed, 'KB/s'] as [number, string]
    const uploadSpeedString = [uploadSpeed, 'KB/s'] as [number, string]

    if (downloadSpeed > 1024) {
        downloadSpeedString[0] /= 1024;
        downloadSpeedString[1] = 'MB/s'
    }

    if (uploadSpeed > 1024) {
        uploadSpeedString[0] /= 1024;
        uploadSpeedString[1] = 'MB/s'
    }

    useEffect(() => {
        // function getTraffic() {
        //     invoke('getTraffic').then((traffic) => {
        //         setTraffic(traffic)
        //     }).finally(() => {
        //         setTimeout(getTraffic, 2000)
        //     })
        // }
        // getTraffic();
    }, [])

    return (
        <Card>
            <Row gutter={16}>
                <Col span={6} >
                    <Card bordered={false}>
                        <Statistic
                            title="上传速度"
                            value={uploadSpeedString[0].toFixed(2)}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                            suffix={uploadSpeedString[1]}
                        />
                    </Card>
                </Col>

                <Col span={6} >
                    <Card bordered={false}>
                        <Statistic
                            title="下载速度"
                            value={downloadSpeedString[0].toFixed(2)}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowDownOutlined />}
                            suffix={downloadSpeedString[1]}
                        />
                    </Card>
                </Col>
            </Row>
        </Card>
    )
}