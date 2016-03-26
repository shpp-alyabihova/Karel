

function KarelCodeEditor(elem) {
    this.element = elem;
    this.active_mode = 'js';
    this.init();
    this.modes = {
        'cpp' : 'text/x-c++src',
        'java': 'text/x-java',
        'js'  : 'text/javascript'
    };
}

KarelCodeEditor.prototype.save = function () {
    Storage.saveCode(this.active_mode, this.getCode());
};


KarelCodeEditor.prototype.init = function () {

    var self = this;

    this.element.html(this.fill());
    // this.$form = this.element.find('form');

    this.$codeArea = this.element.find('.karel-code-editor-code-area');

    this.editor = CodeMirror.fromTextArea(this.$codeArea.get(0), {
        lineNumbers : true,
        lineWrapping: true,
        theme       : "material-dark",
        mode        : "text/javascript",
        keyMap      : "sublime",
        indentUnit  : 4
    });

    // this.$form.on('submit', this.submit.bind(this));
};

KarelCodeEditor.prototype.fill = function () {

    return '' +
        '<div class="code-block">' +
        '<textarea class="karel-code-editor-code-area">' +
        this.load() +
        '</textarea>' + '</div>' + '';
};


KarelCodeEditor.prototype.load = function () {
    return (Storage.getCode(this.active_mode)) ? Storage.getCode(this.active_mode) : matchCode(this.active_mode);
};


KarelCodeEditor.prototype.submit = function (e) {
    if (this.onCodeSubmitCallback && typeof this.onCodeSubmitCallback === 'function') {
      this.onCodeSubmitCallback.call(null);
    }
    e.preventDefault();
};

function matchCode(language) {
    var mainFunc = (language == "cpp") ? "main" : "run";
    var code = '' +
        '// Press Esc to exit from Fullscreen mode.\n' +
        '// Press Play at bottom right to execute.\n' +
        '// Function `'+ mainFunc +'` is the program entry point.\n' +
        '// It would be executed as a program start\n\n';

    if (language == "java") {
        return code +
            'public class MyKarel extends KarelTheRobot {\n\n\tpublic void run() throws Exception {\n\t\tmove();\n\t\tputBeeper();\n\t\tturnLeft();\n\t\tturnLeft();\n\t\tmove();\n\t}\n\n}\n' + '';
    } else {
        mainFunc = (language == "cpp") ? "void main()" : "function run()";
        return code + mainFunc + ' {\n\tmove();\n\tputBeeper();\n\tturnLeft();\n\tturnLeft();\n\tmove();\n}\n' + '';
    }
}

KarelCodeEditor.prototype.getCode = function () {
    // console.log(this.$codeArea.val());
    // return this.$codeArea.val().replace(/(\r\n|\n|\r|[ ])/gm,"");
    return this.editor.getValue();
};

KarelCodeEditor.prototype.onCodeSubmit = function (callback) {
    this.onCodeSubmitCallback = callback;
};

KarelCodeEditor.prototype.setMode = function (mode) {
    this.active_mode = mode;
    this.init();

    if (this.modes[mode]) {
        this.editor.setOption("mode", this.modes[mode]);
    }
};
/*
localStorage.clear();
*/
