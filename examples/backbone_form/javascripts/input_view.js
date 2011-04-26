;(function (globals) {

globals.InputView = Backbone.View.extend({
  
  events: {
    'submit' : 'preview'
  },
  
  preview: function (event) {
    event.preventDefault();
    event.stopPropagation();
    this.options.controller.output({ text: event.target.text.value });
  }
  
});

})(window);