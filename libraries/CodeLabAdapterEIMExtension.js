SnapExtensions.primitives.set("eim_openurl(url)", function (data) {
  window.open(data);
});

SnapExtensions.primitives.set("eim_token", function () {
  if (!window.eim_client) return "";
  return eim_client.adapter_base_client.token;
});

SnapExtensions.primitives.set("eim_running?", function () {
  if (!window.eim_client) return false;
  return eim_client.adapter_base_client.connected;
});

SnapExtensions.primitives.set("eim_timeout(timeout)", function (timeout) {
  eim_client.emit_timeout = timeout * 1000;
});

SnapExtensions.primitives.set(
  "eim_controlext(content, ext)",
  function (content, ext_name) {
    const NODE_ID = "eim";
    eim_client.adapter_base_client.emit_with_messageid_for_control(
      NODE_ID,
      content,
      ext_name,
      "extension"
    );
  }
);

SnapExtensions.primitives.set(
  "eim_controlnode(content, node)",
  function (content, node_name) {
    const NODE_ID = "eim";
    eim_client.adapter_base_client.emit_with_messageid_for_control(
      NODE_ID,
      content,
      node_name,
      "node"
    ); // promise, todo
  }
);

SnapExtensions.primitives.set("eim_extstate", function (ext_name) {
  return JSON.stringify(eim_client.exts_statu);
});

SnapExtensions.primitives.set("eim_nodesstate", function (ext_name) {
  return JSON.stringify(eim_client.nodes_statu);
});

SnapExtensions.primitives.set("eim_msg", function () {
  return eim_client.adapter_msg;
});

SnapExtensions.primitives.set("eim_msgtime", function () {
  return eim_client.adapter_msg_time;
});

SnapExtensions.primitives.set(
  "eim_broadcast(node_id, content)",
  function (node_id, content) {
    const NODE_ID = "eim";
    eim_client.adapter_base_client.emit_without_messageid(node_id, content);
  }
);

SnapExtensions.primitives.set(
  "eim_broadcastwait(node_id, content)",
  function (node_id, content, proc) {
    const NODE_ID = "eim";
    let promise = eim_client.emit_with_messageid(node_id, content);
    const promiseId = Math.floor(Math.random() * 1000000000);
    promise.then((value) => {
        try {
            proc.doSetVar('isDone', true);
            proc.doSetVar('reply', value);
        } catch(e) {console.error(e)}
    });
  }
);
