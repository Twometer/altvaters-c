(function() {

    const filler_words = ["nun", "so", "ihr"];

    function AltvaterParser() {

    }
    
    AltvaterParser.prototype.parse = function(codeFiles) {
        var lines = [];
        for (var code of codeFiles) {
            var lineCtr = 0;
            for(var line of code.split('\n')) {
                lineCtr++;
                var l = processLine(line);
                if (!!l)
                    {
                        l.lineNum = lineCtr;
                        lines.push(l);                        
                    }
            }
        }

        var blocks = [];
        readBlocks(lines, blocks, 0, 0);
        console.log(blocks);
        return blocks;
    }
    
    function cleanLine(line) {
        let v = [];
        for (let i of line.toLowerCase().split(' ')) {
            if (i.trim().length == 0)
                continue;
            if (filler_words.includes(i))
                continue;
            v.push(i);
        }
        return v.join(' ').trim();
    }

    function readBlocks(lines, blocks, offset, baseIndent, parent) {
        for (var i = offset; i < lines.length; i++) {
            var curLine = lines[i];
            var nextLine = lines[i + 1];
            if (i == lines.length - 1) {
               blocks.push({instr: curLine.text, blocks:[], parent:parent, line: curLine.lineNum});
            } else {
                if (curLine.indent < baseIndent)
                    return i - offset;

                if (nextLine.indent > curLine.indent){
                    var subblocks = [];
                    var new_parent = {};
                    var read = readBlocks(lines, subblocks, i + 1, nextLine.indent, new_parent);
                    i += read;
                    new_parent.instr = curLine.text;
                    new_parent.blocks = subblocks;
                    new_parent.parent = parent;
                    new_parent.line = curLine.lineNum;
                    blocks.push(new_parent);
                } else {
                    blocks.push({instr: curLine.text, blocks:[], parent:parent, line: curLine.lineNum})
                }
            }
        }
        return lines.length - offset;
    }

    function processLine(line) {
        if (line.trim().length == 0)
            return null;
        line = line.replaceAll('\t', ' ');

        var indent = 0;
        for (var i = 0; i < line.length; i++)
            if (line[i] == ' ')
                indent++;
            else
                break;

        return {indent: Math.floor(indent / 4), text: cleanLine(line)};
    }

    window.AltvaterParser = new AltvaterParser();

})();