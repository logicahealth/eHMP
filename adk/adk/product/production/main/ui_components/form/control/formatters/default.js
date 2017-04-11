define([], function() {
  "use strict";
  return {

    /**
       Takes a raw value from a model and returns an optionally formatted string
       for display. The default implementation simply returns the supplied value
       as is without any type conversion.

       @param {*} rawData
       @param {Backbone.Model} model Used for more complicated formatting
       @return {*}
    */
    fromRaw: function(rawData, model) {
      return rawData;
    },

    /**
       Takes a formatted string, usually from user input, and returns a
       appropriately typed value for persistence in the model.

       If the user input is invalid or unable to be converted to a raw value
       suitable for persistence in the model, toRaw must return `undefined`.

       @param {string} formattedData
       @param {Backbone.Model} model Used for more complicated formatting
       @return {*|undefined}
    */
    toRaw: function(formattedData, model) {
      return formattedData;
    }
  };
});