(function () {
    // node
    const fs = require('fs'); 
    var stdlib = "";

    var current_console_promise = null;

    // runtime
    function AltvaterRuntime() {

    }

    AltvaterRuntime.prototype.execute = function (code) {
        var ast = AltvaterParser.parse(stdlib + "\n" + code);
        var js = AltvaterCodegen.generate(ast);
        console.log(js);
        eval(js);
    };

    AltvaterRuntime.prototype.loadStdLib = function () {
        let dir = __dirname + "/../stdlib/stdlib.schriftstück";
        stdlib = fs.readFileSync(dir, {encoding:'utf8', flag:'r'}); 
        console.log(stdlib);
    }

    AltvaterRuntime.prototype.file_delete = async (file) => {

    };

    
    AltvaterRuntime.prototype.console_println = async (data) => {
        writeConsole(data);
    };

    AltvaterRuntime.prototype.sound = async (hertz) => {
        console.log("Making noise!");
    };

    AltvaterRuntime.prototype.file_create = async (path) => {

    };

    AltvaterRuntime.prototype.file_exists = async (path) => {

    };

    AltvaterRuntime.prototype.get_time = async () => {

    };

    AltvaterRuntime.prototype.console_readln = () => {
        var prom = new Promise((resolve, reject) => {
            current_console_promise = resolve;
        });
        return prom;
    };

    AltvaterRuntime.prototype.on_read_line = (ln) => {
        if (current_console_promise == null)
            return;
        current_console_promise(ln);
        current_console_promise = null;
    };

    AltvaterRuntime.prototype.delayseconds = async (t) => {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, t * 1000);
        });
    };


    window.__rt = new AltvaterRuntime();
})();