// todo，合并命令，使其灵活，易于扩展和更新，使用 list 风格（microblocks），function name + parameter list

SnapExtensions.primitives.set("eim_get(name)", function (name) {
  return ({
    'token': eim_client.adapter_base_client.token,
    'running': eim_client.adapter_base_client.connected,
    'timeout': eim_client.emit_timeout,
    'extstate': JSON.stringify(eim_client.exts_statu),
    'nodesstate': JSON.stringify(eim_client.nodes_statu),
    'pluginmsgs': JSON.stringify(eim_client.pluginMessages)
  })[name]
});

SnapExtensions.primitives.set("eim_timeout(timeout)", function (timeout) {
  eim_client.emit_timeout = timeout * 1000;
});

SnapExtensions.primitives.set(
  "eim_control(plugin, content, ext)",
  // plugin extension/node
  function (plugin, content, ext_name, proc) {
    const NODE_ID = "eim";
    let promise = eim_client.adapter_base_client.emit_with_messageid_for_control(
      NODE_ID,
      content,
      ext_name,
      plugin
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
    /*
    promise.catch((e) => {
      try {
        proc.doSetVar("isDone", true);
        proc.doSetVar("reply", e);
      } catch (err) {
        console.error(err);
      }
    });
    */
  }
);

// mqt_connect(broker,callback,options)
// 想要 这样的结构，能够在 Snap 中处理外部系统的事件
// 在系统内接收事件？ broadcast
// on_msg(notify/plugin,callback)

SnapExtensions.primitives.set("eim_onmsg(type, node_id, callback)", 
  function (type, node_id, callback) {
    // todo 减少 EIM primitive 数量
    if (type == 'notify') {
      // 设备断开通知
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
    }
    if (type == 'plugin') {
      // devices_list
    }
});

// onAdapterPluginMessage, onpluginmsg(node_id, callback)
// eim_client._onPluginMsg_callbacks
// scratch overdrive: msg.message.payload.message_type === 'devices_list'
// 不要修改核心的东西, diff eim插件和当前库，避免太多侵入修改


///////////////////


// helpers

SnapExtensions.primitives.set("eim_helper(fname, args)", 
function (fname, args, proc) {
  // args is a list
  proc.assertType(args, 'list');
  data = args.itemsArray();
  // console.log(data);
  if (fname == 'log') console.log(data);
  if (fname == 'openurl') window.open(data[0]);
  if (fname == 'createobj') {return {[data[0]]: data[1]}};
  if (fname == 'getobj') {return data[0][data[1]]}; // return obj.name
});

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


/*
// microblocks function name function name, 调用 vm 通用 UI, fname, args list
// vm 可扩展，不破坏旧的积木
SnapExtensions.primitives.set("eim_call(fname, args)", 
function (fname, args, proc) {
  // args is a list
  proc.assertType(args, 'list');
  data = args.itemsArray(),
  console.log(data);
});
*/