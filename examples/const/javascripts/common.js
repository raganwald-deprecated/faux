;(function (globals, $) {
  
  Backbone.sync = function (method, model, success, error) {
    if ('read' == method) {
      success({
        models: [
          {
            hours: 3,
            minutes: 30
          },
          {
            hours: 2,
            minutes: 15
          },
          {
            hours: 3,
            minutes: 10
          },
          {
            hours: 7,
            minutes: 30
          },
          {
            hours: 10,
            minutes: 45
          },
        ]
      });
    }
    else throw new Error("Don't know how to mock "+method);
  
})(window, jQuery);