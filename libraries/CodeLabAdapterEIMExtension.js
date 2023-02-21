// todo，合并命令，使其灵活，易于扩展和更新，使用list 风格，command name + options

// getter
SnapExtensions.primitives.set("eim_token", function () {
  if (!window.eim_client) return "";
  return eim_client.adapter_base_client.token;
});

SnapExtensions.primitives.set("eim_running?", function () {
  if (!window.eim_client) return false;
  return eim_client.adapter_base_client.connected;
});

SnapExtensions.primitives.set("eim_extstate", function (ext_name) {
  return JSON.stringify(eim_client.exts_statu); 
});

SnapExtensions.primitives.set("eim_nodesstate", function (ext_name) {
  return JSON.stringify(eim_client.nodes_statu);
});

SnapExtensions.primitives.set("eim_pluginmsgs", function () {
  return JSON.stringify(eim_client.pluginMessages);
});

/*
SnapExtensions.primitives.set("eim_pluginntfys", function () {
  if (!eim_client.pluginNotify){
    return JSON.stringify({})
  }
  else{
    return JSON.stringify(eim_client.pluginNotify); // json string
  }
});


SnapExtensions.primitives.set("eim_deviceconnected", function () {
  if (!eim_client.deviceconnected){
    return JSON.stringify({})
  }
  else{
    return JSON.stringify(eim_client.deviceconnected); // json string
  }
});
*/

// setter
SnapExtensions.primitives.set("eim_log(data)", function (data) {
  console.log(data); // for debug
});

SnapExtensions.primitives.set("eim_openurl(url)", function (data) {
  window.open(data);
});

SnapExtensions.primitives.set("eim_timeout(timeout)", function (timeout) {
  eim_client.emit_timeout = timeout * 1000;
});

// 前三个 eim_helper()


SnapExtensions.primitives.set(
  "eim_controlext(content, ext)",
  function (content, ext_name, proc) {
    const NODE_ID = "eim";
    let promise = eim_client.adapter_base_client.emit_with_messageid_for_control(
      NODE_ID,
      content,
      ext_name,
      "extension"
    );
    promise.then((value) => {
      try {
        proc.doSetVar("isDone", true);
        // proc.doSetVar("reply", value);
      } catch (e) {
        console.error(e);
      }
    });
  }
);

SnapExtensions.primitives.set(
  "eim_controlnode(content, node)",
  function (content, node_name, proc) {
    const NODE_ID = "eim";
    let promise = eim_client.adapter_base_client.emit_with_messageid_for_control(
      NODE_ID,
      content,
      node_name,
      "node"
    );
    promise.then((value) => {
      try {
        proc.doSetVar("isDone", true);
        // proc.doSetVar("reply", value);
      } catch (e) {
        console.error(e);
      }
    });
  }
);


SnapExtensions.primitives.set(
  "eim_broadcast(node_id, content)",
  function (node_id, content) {
    // const NODE_ID = "eim";
    eim_client.adapter_base_client.emit_without_messageid(node_id, content);
  }
);

SnapExtensions.primitives.set(
  "eim_broadcastwait(node_id, content, timeout)",
  function (node_id, content, timeout, proc) {
    // const NODE_ID = "eim";
    const timeout_ = timeout ? timeout * 1000 : eim_client.emit_timeout;
    // console.log(timeout_);
    let promise = eim_client.adapter_base_client.emit_with_messageid(node_id, content, timeout_); // timeout
    const promiseId = Math.floor(Math.random() * 1000000000);
    promise.then((value) => {
      try {
        proc.doSetVar("isDone", true);
        proc.doSetVar("reply", value);
      } catch (e) {
        console.error(e);
      }
    });
    promise.catch((e) => {
      try {
        proc.doSetVar("isDone", true);
        proc.doSetVar("reply", e);
      } catch (err) {
        console.error(err);
      }
    });
  }
);

// helper
// send image to adapter
SnapExtensions.primitives.set(
  "eim_costume2base64(cst, name)",
  function (cst, name, proc) {
    function dataURItoBlob(text, mimeType) {
      var i,
        data = text,
        components = text.split(","),
        hasTypeStr = text.indexOf("data:") === 0;
      // Convert to binary data, in format Blob() can use.
      if (hasTypeStr && components[0].indexOf("base64") > -1) {
        text = atob(components[1]);
        data = new Uint8Array(text.length);
        i = text.length;
        while (i--) {
          data[i] = text.charCodeAt(i);
        }
      } else if (hasTypeStr) {
        // not base64 encoded
        text = text.replace(/^data:image\/.*?, */, "");
        data = new Uint8Array(text.length);
        i = text.length;
        while (i--) {
          data[i] = text.charCodeAt(i);
        }
      }
      return new Blob([data], { type: mimeType });
    }
    var ide = this.parentThatIsA(IDE_Morph);
    proc.assertType(cst, "costume");
    name = name || cst.name || localize("costume");
    proc.assertType(name, ["text", "number"]);
    name = name.toString();
    let contents;
    if (cst instanceof SVG_Costume) {
      console.log("SVG_Costume");
      // ide.saveFileAs(cst.contents.src, 'text/svg', name);
      contents = cst.contents.src.toDataURL();
      let fileType = "text/svg";
    } else if (cst.embeddedData) {
      console.log("png");
      // embed payload data (e.g blocks)  inside the PNG image data
      // ide.saveFileAs(cst.pngData(), 'image/png', name);
      contents = cst.pngData().toDataURL();
      let fileType = "image/png";
    } else {
      // rasterized Costume
      // 精灵和舞台(视频)snap都是这里，png
      // console.log("rasterized Costume")
      // ide.saveCanvasAs(cst.contents, name); -> saveFileAs(canvas.toDataURL(), 'image/png', fileName);
      contents = cst.contents.toDataURL();
      let fileType = "image/png";
    }
    if (!(contents instanceof Blob)) {
      contents = dataURItoBlob(contents, "image/png");
    }
    // console.log(contents);// blob
    var reader = new FileReader();
    reader.readAsDataURL(contents);
    reader.onloadend = function () {
      var base64data = reader.result;
      // console.log(base64data);
      try {
        proc.doSetVar("isDone", true);
        proc.doSetVar("reply", base64data);
      } catch (e) {
        console.error(e);
      }
      // todo send to Adapter
    };
  }
);

// mqt_connect(broker,callback,options)
// 想要 这样的结构，能够在 Snap 中处理外部系统的事件
// 在系统内接收事件？ broadcast
// on_msg(notify/plugin,callback)

SnapExtensions.primitives.set("eim_notify(node_id, callback)", 
  function (node_id, callback) {
    // todo 减少 EIM primitive 数量
    eim_client._notify_callbacks[node_id] = (msg) => {
      console.log('eim_notify', msg);
      let p = new Process();
      try {
				p.initializeFor(callback, new List([JSON.stringify(msg)]));
			} catch(e) {
				p.initializeFor(callback, new List([]));
			}
      let stage =  this.parentThatIsA(StageMorph);
			stage.threads.processes.push(p);
  }
});

// onAdapterPluginMessage, onpluginmsg(node_id, callback)
// eim_client._onPluginMsg_callbacks
// scratch overdrive: msg.message.payload.message_type === 'devices_list' 
// 不要修改核心的东西, diff eim插件和当前库，避免太多侵入修改