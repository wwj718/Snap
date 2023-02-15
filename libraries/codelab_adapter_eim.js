// EIM: Everything Is Message
// EIM 与 webui client 的区别: EIM 不关心关于环境的信息

class EIMClient {
    update_nodes_status (nodes_status) {
        this.exts_statu = nodes_status.exts_status_and_info;
        this.nodes_statu = nodes_status.node_status_and_info;
        console.log('this.exts_statu ->', this.exts_statu);
    }

    node_statu_change_callback (extension_node_name, content) {
        const status_checked_map = {start: true, stop: false};
        if (extension_node_name.startsWith('extension_')) {
            this.exts_statu[extension_node_name].is_running =
                status_checked_map[content];
            console.log(`extension statu change to ${content}`);
        }
        if (extension_node_name.startsWith('node_')) {
            this.nodes_statu[extension_node_name].is_running =
                status_checked_map[content];
            console.log(`node statu change to ${content}`);
        }
    }

    onAdapterPluginMessage (msg) {
        this.adapter_node_content_hat = msg.message.payload.content; // todo topic
        this.adapter_node_content_reporter = msg.message.payload.content;
        this.node_id = msg.message.payload.node_id;
        this.adapter_node_time = Date.now(); // for Snap!
        this.adapter_msg = JSON.stringify(msg); // todo primitive get_adapter_msg
    }

    constructor (node_id, help_url, runtime) {
        this._runtime = runtime;
        this.NODE_ID = node_id;
        this.HELP_URL = help_url;

        // eim
        this.exts_statu = {};
        this.nodes_statu = {};
        this.emit_timeout = 5000; // ms


        this.adapter_base_client = new AdapterBaseClient(
            null, // onConnect,
            null, // onDisconnect,
            null, // onMessage,
            this.onAdapterPluginMessage.bind(this), // onAdapterPluginMessage,
            this.update_nodes_status.bind(this), // update_nodes_status,
            this.node_statu_change_callback.bind(this), // node_statu_change_callback,
            null, // notify_callback,
            null, // error_message_callback,
            null, // update_adapter_status
            100, // SendRateMax // EIM没有可以发送100条消息
            runtime
        );

        // init for snap call
        this.adapter_node_content_hat = 0 // todo topic
        this.adapter_node_content_reporter = 0;
        this.node_id = 0;
        this.adapter_node_time = Date.now(); // for Snap!
        this.adapter_msg = JSON.stringify({});

    }

    emit_with_messageid (NODE_ID, content) {
        return this.adapter_base_client.emit_with_messageid(
            NODE_ID,
            content,
            this.emit_timeout
        );
    }

    isTargetMessage (content) {
        // 是逻辑判断
        if (
            this.adapter_node_content_hat &&
            (content === this.adapter_node_content_hat || content === '_any')
        ) {
            // 1/100秒后清除
            setTimeout(() => {
                this.adapter_node_content_hat = null; // 每次清空
            }, 1); // ms， 1/1000s ，只有一个通道 可能会覆盖消息。
            return true;
        }
    }

    isTargetTopicMessage (targerNodeId, targetContent) {
        if (
            (targetContent === this.adapter_node_content_hat ||
                targetContent === '_any') &&
            targerNodeId === this.node_id
        ) {
            setTimeout(() => {
                this.adapter_node_content_hat = null; // 每次清空
                this.node_id = null;
            }, 1); // ms
            return true;
        }
    }

    formatExtension () {
        // text value list
        console.debug('formatExtension exts_statu -> ', this.exts_statu);
        if (this.exts_statu && Object.keys(this.exts_statu).length) {
            // window.extensions_statu = this.exts_statu;
            const extensions = Object.keys(this.exts_statu).map(ext_name => ({
                text: ext_name,
                value: ext_name
            }));
            return extensions;
        }
        return [
            {
                text: 'extension_python',
                value: 'extension_python'
            }
        ];
    }

    formatNode () {
        // text value list
        if (this.nodes_statu && Object.keys(this.nodes_statu).length) {
            const nodes = Object.keys(this.nodes_statu).map(node_name => ({
                text: node_name,
                value: node_name
            }));
            return nodes;
        }
        return [
            {
                text: 'node_physical_blocks',
                value: 'node_physical_blocks'
            }
        ];
    }
}

// eim_client = new EIMClient(NODE_ID, HELP_URL);