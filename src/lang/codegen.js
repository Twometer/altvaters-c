(function() {

    const main_method = "gott zum gruße";

    function CodeGen() {
        this.data = "";
        this.known_methods = [];
        this.defined_objects = [];
    }

    CodeGen.prototype.append = function(str) {
        this.data += str;
    }

    CodeGen.prototype.appendln = function(str) {
        this.data += str + "\n";
    }

    CodeGen.prototype.eol = function(str) {
        this.data += "\n";
    }

    CodeGen.prototype.to_string = function() {
        return this.data;
    }

    function AltvaterCodegen() {

    }

    window.AltvaterCodegen = new AltvaterCodegen();

    AltvaterCodegen.prototype.generate = function(ast) {
        var js = new CodeGen();

        for (let block of ast) {
            this.handleBlock(block, js);
        }

        console.log(js.known_methods);

        js.append(main_method.sanitize() + "(); // call entry point!");
        return js.to_string();
    }

    AltvaterCodegen.prototype.handleBlock = function(block, js, parentname) {
        var instruction = block.instr;
        var children = block.blocks;
        block.defined_objects = [];

        if (instruction.startsWith("es gelüstet mich nach")) {     // Import
            if (parentname != null)
                codegen_error(block, "Welch Strolch übergibt mir solche Textstücke! Es vermag dir nur im globalen Scope nach globalen Objekten zu gelüsten!");
            var required_name = instruction.after("gelüstet mich nach").before("als");
            var alias = instruction.after("als");
            js.defined_objects.push({name: required_name, alias: alias.sanitize()});
            js.appendln("window." + alias.sanitize() + " = new " + required_name.sanitize() + "();");
        }
        else if (instruction.endsWith("):")) {    // Method def
            let name_unsanitized = instruction.before('(');
            let name = name_unsanitized.sanitize();
            let args = instruction.after('(').before(')');
            
            if (!parentname) { // method out of class
                js.appendln("async function " + name + "(" + args + "){");
                js.known_methods.push({parent: "", name: name_unsanitized})
            } else {    // Method in class
                js.appendln(parentname + '.prototype.' + name + '= async function(' + args + "){");
                js.known_methods.push({"parent": parentname, "name": name_unsanitized});
            }
            for (let child of children)
                this.handleBlock(child, js, name);
            js.appendln('}');
        }
        else if (instruction.startsWith('gevatter')) {  // Class def
            var classname = instruction.after("gevatter").before(":").sanitize();
            js.appendln("function " + classname + '() {} ');
            for (let child of children)
                this.handleBlock(child, js, classname);
        }
        else if (instruction.startsWith('möge') || instruction.startsWith("lasset")) {
            let prefix = "lasset";
            if (instruction.startsWith('möge'))
                {
                    js.append('var ');
                    prefix = "möge";
                }
            if (instruction.endsWith('bekannt werden')) {
                let name = instruction.after(prefix).before("als").sanitize();
                let type = instruction.after("als").before("bekannt");
                js.appendln(name + "; // Type: " + type); 
                block.parent.defined_objects.push({name:type, alias:name});
                // generics
            } else if (instruction.endsWith('sprechen')) {
                let name = instruction.after(prefix).before(" ").sanitize();
                js.appendln(name + " = " +( instruction.includes('unwahrheit') ? 'false' : 'true') + '; // Type: bool');
                // bool
            } 
        } 
        else if (instruction == 'weichet zurück') {
            js.appendln('return;');
        }
        else if (instruction.startsWith("potz wetter!")) {
            js.appendln('throw new Error("' + instruction.after('"').before('"') + '");');
        }
        else if (instruction.startsWith("tänzelt"))
        {
            var condition = parse_condition(instruction.after('solange').before(':'));
            js.appendln('while(' + condition + ') {');
            for (let child of children)
                this.handleBlock(child, js);
            js.appendln('}');
        } else if (instruction.startsWith("sei gegeben")) {
            var condition = instruction.after(', dass').before(':');
            js.appendln('if(' + parse_condition(condition) + ') {');
            for (let child of children)
                this.handleBlock(child, js, name);
            js.appendln('}');
        } else if (instruction.startsWith("ansonsten prüfet")){
            var condition = instruction.after(', ob').before(':');
            js.appendln('else if (' + parse_condition(condition) + ') {')
            for (let child of children)
                this.handleBlock(child, js, name);
            js.appendln('}');
        } else if (instruction.startsWith("schlage alles bemühen fehl")){
            js.appendln('else{');
            for (let child of children)
                this.handleBlock(child, js, name);
            js.appendln('}');
        } else if (instruction.startsWith("rechnet mit")) {
            let varname = instruction.after("rechnet mit");
            let opsep =  varname.includes(',') ? ',' : 'und';
            varname = varname.before(opsep);

            function __writeOp(op) {
                if (op.includes('multiplizieret'))
                    js.appendln(varname + " *= " + (op.after("multiplizieret").replaceAll("mit", "")) + ";");
                else if (op.includes('dividieret'))
                    js.appendln(varname + " /= " + (op.after("dividieret").replaceAll("durch", "")) + ";");
                else if (op.includes('addieret'))
                    js.appendln(varname + " /= " + (op.after("addieret")) + ";");
                else if (op.includes('subtrahieret'))
                    js.appendln(varname + " /= " + (op.after("subtrahieret")) + ";");
            }

            let op = instruction.after(opsep);
            while (op != "") {
                if (!op.includes(',') && !op.includes('und')) {
                    __writeOp(op);
                    break;
                }
                opsep =  op.includes(',') ? ',' : 'und';
                __writeOp(op.before(opsep));
                op = op.after(opsep);
            }
        }
        else {
            if (instruction.startsWith("$$")){  // verbatim / native code to implement sys api
                js.appendln(instruction.after("$$"));
                return;
            }

            var calledObjPrefix = "";
            if (instruction.includes(',')){
                var calledObj = instruction.before(',').sanitize();
                instruction = instruction.after(',');
                calledObjPrefix = calledObj;
            }

            let dstVar = null;
            let method = instruction;
            if (instruction.includes("und schreibet")) {
                dstVar = instruction.after("und schreibet in").sanitize();
                method = instruction.before("und schreibet in");
            }
            
            if (dstVar != null)
                js.append(dstVar + " = ");

            function resolveGlobalObject(objname){
                for (let o of js.defined_objects) {
                    if (objname.startsWith(o.alias)) {
                        return o;
                    }
                }
                for (let o of block.defined_objects) {
                    if (objname.startsWith(o.alias)) {
                        return o;
                    }
                }
                let p = block.parent;
                while (p != null)
                {
                    for (let o of p.defined_objects) {
                        if (objname.startsWith(o.alias)) {
                            return o;
                        }
                    }   
                    p = p.parent;
                }
                return undefined;
            }

            let isGlobal = calledObjPrefix == ""; 
            let obj_def = isGlobal  ? null : resolveGlobalObject(calledObjPrefix);

            if (!isGlobal && obj_def == null) {
                codegen_error(block, "cannot resolve object " + calledObjPrefix);
            }

            let obj_name = isGlobal  ? "" : obj_def.name;

            if (calledObjPrefix != "" && obj_def == undefined){
                codegen_error(block, "undefined object " + calledObjPrefix);
            }

            var method_def = undefined;
            for(let m of js.known_methods) {
                if (m.parent == obj_name && method.startsWith(m.name)){
                    method_def = m;
                }
            }

            if (method_def == undefined) {
                if (obj_name == "")
                    codegen_error(block, "undefined global method " + method);
                else
                    codegen_error(block, "undefined method " + method + " on obj " + obj_name);
            }
            
            js.append("await ");
            if (calledObjPrefix != "")
                js.append(calledObjPrefix + ".");

            js.append(method_def.name.sanitize());

            let args = instruction.after(method_def.name);
            if (args.includes("und schreibet"))
                args = args.before("und schreibet");
            else if (args.includes("und"))
                codegen_error(block, "unexpected 'und'");
            let parsedArgs = parse_args(args);          
            js.appendln("(" + parsedArgs + ");");
        }
    }

    function parse_args(a) {
        a = a.replaceAll("den wert von", "");
        if (a.startsWith("für")) a = a.after("für");
        if (a.startsWith("von")) a = a.after("von");
        if (a.startsWith("der")) a = a.after("der");
        
        
        let i = 0;
        let char = a[i];
        if (isNum(char)){  // Its a number, so ignore all suffixes
            let numerical = '';
            while (i < a.length && isNum(char = a[i]))
                {
                    numerical += char;
                    i++;
                }
            return numerical;
        }

        return a.trim();
    }

    function isNum(chr) {
        return chr >= '0' && chr  <= '9';
    }

    function parse_condition(cond) {
        return cond.replaceAll('entspreche','==').replaceAll("die unwahrheit spreche", "== false").replaceAll("die wahrheit spreche", "==true");
    }

    function codegen_error(block, error) {
        console.error(block);
        throw new Error("Code generation failed: " + error);
    }

    String.prototype.sanitize = function() {
        return this.replaceAll(' ', '_').replaceAll('ß','_ss').replaceAll('ü','_ue').replaceAll('ö','_oe').replaceAll('ä','_ae');
    }

    String.prototype.after = function(l) {
        return this.substr(this.indexOf(l) + l.length).trim();
    };

    String.prototype.before = function(l) {
        return this.substr(0, this.indexOf(l)).trim();
    }

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };


})();