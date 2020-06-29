(function() {
    function AltvaterRuntime() {

    }
    
    AltvaterRuntime.prototype.execute = function(code) {
        var ast = AltvaterParser.parse(code);
        var js = AltvaterCodegen.generate(ast);
        console.log(js);
        //eval(js);
    }
    
    window.__rt = new AltvaterRuntime();
})();