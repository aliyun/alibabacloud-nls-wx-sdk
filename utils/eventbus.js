/*
    from github: https://github.com/littlebaozi/EventEmitter
    author: littlebaozi
    license: unknown
*/
class EventBus {
  // 订阅
  on (event, fn, context) {
      // 判断fn是否是函数
      if(typeof fn != "function"){
          console.error('fn must be a function');
          return;
      }
      // 将event的fn存放在store中
      this._stores = this._stores || {};
      (this._stores[event] = this._stores[event] || []).push({cb: fn, ctx: context});
   
  }

  // 发布
  emit (event) {
      this._stores = this._stores || {};
      var store = this._stores[event],args;
      // 遍历执行事件
      if(store){
          store = store.slice(0);
          args = [].slice.call(arguments, 1); //获取传入的参数，https://segmentfault.com/q/1010000005643934

          for(var i =0,len = store.length;i < len; i++){
              store[i].cb.apply(store[i].ctx, args);
          }
      }
  }

  // 注销
  off (event, fn) {
      this._stores = this._stores || {};

      // 删除所有
      if(!arguments.length){
          this._stores = [];
          return;
      }

      var store = this._stores[event];
      if(!store){
          return;
      }

      // 删除指定event
      if(arguments.length === 1){
          delete this._stores[event];
          return;
      }

      // 删除指定fn
      for(var i=0, len = store.length; i < len; i++){

          if(fn === store[i].cb){
             store.splice(i,1);  //splice slice
          }
      }

  }
}

module.exports = EventBus;