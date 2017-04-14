define([], function() {
    return function(func, threshold, onLeadingEdge) {
        var timeout;
        return function debounced() {
            var obj = this,
                args = arguments;

            function delayed() {
                if (!onLeadingEdge)
                    func.apply(obj, args);
                timeout = null;
            }

            if (timeout)
                clearTimeout(timeout);
            else if (onLeadingEdge)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 100);
        };
    };
});