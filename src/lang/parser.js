(function() {

    const filler_words = ["nun", "so", "es", "den", "dem", "des", "der", "die", "das", "zu", "ihr"];

    function AltvaterParser() {

    }
    
    AltvaterParser.prototype.parse = function(code) {
        var lines = [];
        for(var line of code.split('\n')) {
            var l = processLine(line);
            if (!!l)
                lines.push(l);
        }

        var blocks = [];
        readBlocks(lines, blocks, 0, 0);
        console.log(blocks);
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

    function readBlocks(lines, blocks, offset, baseIndent) {
        for (var i = offset; i < lines.length; i++) {
            var curLine = lines[i];
            var nextLine = lines[i + 1];
            if (i == lines.length - 1) {
               blocks.push({instr: curLine.text, blocks:[]});
            } else {
                if (curLine.indent < baseIndent)
                    return i - offset;

                if (nextLine.indent > curLine.indent){
                    var subblocks = [];
                    var read = readBlocks(lines, subblocks, i + 1, nextLine.indent);
                    i += read;
                    blocks.push({instr: curLine.text, blocks: subblocks})
                } else {
                    blocks.push({instr: curLine.text, blocks:[]})
                }
            }
        }
        return lines.length - offset;
    }

    function processLine(line) {
        if (line.trim().length == 0)
            return null;
        line = line.replace('\t', ' ');

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