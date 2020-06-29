(function () {
    function AltvaterRuntime() {

    }

    AltvaterRuntime.prototype.execute = function (code) {
        var ast = AltvaterParser.parse(code);
        var js = AltvaterCodegen.generate(ast);
        console.log(js);
        eval(js);
    }

    AltvaterRuntime.prototype.file_delete = async (file) => {

    };

    AltvaterRuntime.prototype.console_println = async (data) => {
        console.log(data);
    };

    AltvaterRuntime.prototype.sound = async (hertz) => {

    };

    AltvaterRuntime.prototype.file_get = async (path) => {

    };

    AltvaterRuntime.prototype.file_create = async (path) => {

    };

    AltvaterRuntime.prototype.file_exists = async (path) => {

    };

    AltvaterRuntime.prototype.get_time = async () => {

    };

    AltvaterRuntime.prototype.console_readln = () => {
        return new Promise((resolve, reject) => {

        });
    };

    AltvaterRuntime.prototype.delaySeconds = async () => {
        console.log("Delay!");
    };


    window.__rt = new AltvaterRuntime();
})();