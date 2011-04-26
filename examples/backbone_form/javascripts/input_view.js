;(function (globals) {

globals.InputView = Backbone.View.extend({
  
  initialize: function () {
    this.text = this.options.text || 'Hello *there*';
  },
  
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