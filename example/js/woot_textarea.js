(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Woot.TextareaAdapter = (function() {

    function TextareaAdapter(socket, editor_id, authors_id) {
      this.contents = __bind(this.contents, this);
      this.update = __bind(this.update, this);
      this.contentsInit = __bind(this.contentsInit, this);
      this.ins = __bind(this.ins, this);
      this.del = __bind(this.del, this);
      this.cursorCreate = __bind(this.cursorCreate, this);
      this.keyup = __bind(this.keyup, this);
      this.keypress = __bind(this.keypress, this);
      this.keydown = __bind(this.keydown, this);      this.socket = socket;
      this.site_id = Math.floor((Math.random() * 999) + 1);
      this.editor = $(editor_id);
      this.site = new Woot.Site(this);
      this.author_ids = [];
      if (authors_id != null) {
        this.authors = $(authors_id);
        this.authors.append('<div>Author' + this.site_id + ' - me</div>');
        this.author_ids.push(this.site_id);
      }
      this.socket.emit('woot_send', {
        type: 'cursor-create',
        id: this.site_id,
        sender: this.site_id,
        state: null
      });
      this.editor.on('keydown', this.keydown);
      this.editor.on('keypress', this.keypress);
      this.editor.on('keyup', this.keyup);
    }

    TextareaAdapter.prototype.keydown = function() {
      return this.orig_length = this.editor.val().length;
    };

    TextareaAdapter.prototype.keypress = function(e) {
      if (e.which !== 10 && e.which !== 13 && (e.which < 32 || e.which > 126)) {
        return;
      }
      return this.site.generateIns(this.editor[0].selectionStart, String.fromCharCode(e.which));
    };

    TextareaAdapter.prototype.keyup = function(e) {
      var length, sel;
      sel = this.editor[0].selectionStart;
      length = this.editor.val().length;
      if (e.which === 8 && sel >= 0 && this.orig_length > length) {
        this.site.generateDel(sel + 1);
      }
      if (e.which === 46 && sel <= length && this.orig_length > length) {
        return this.site.generateDel(sel + 1);
      }
    };

    TextareaAdapter.prototype.cursorCreate = function(op) {
      var author;
      author = 'Author' + op.id;
      if (!this.author_ids[op.id]) {
        this.author_ids.push(op.id);
        if (op.state && this.site.empty()) {
          this.site.string = op.state.string;
          this.site.chars_by_id = op.state.chars_by_id;
          this.site.pool = op.state.pool;
          this.update();
        }
        if (this.site_id !== op.sender) {
          this.socket.emit('woot_send', {
            type: 'cursor-create',
            id: this.site_id,
            sender: op.sender,
            state: {
              string: this.site.string,
              chars_by_id: this.site.chars_by_id,
              pool: this.site.pool
            }
          });
        }
        if (this.authors != null) {
          return this.authors.append('<div>' + author + '</div>');
        }
      }
    };

    TextareaAdapter.prototype.del = function(op) {
      return this.update();
    };

    TextareaAdapter.prototype.ins = function(op) {
      return this.update();
    };

    TextareaAdapter.prototype.contentsInit = function(contents) {
      var char, index, _len;
      for (index = 0, _len = contents.length; index < _len; index++) {
        char = contents[index];
        this.site.generateIns(index, char);
      }
      return this.update();
    };

    TextareaAdapter.prototype.update = function() {
      var editor, end, scroll, start;
      editor = this.editor[0];
      start = editor.selectionStart;
      end = editor.selectionEnd;
      scroll = editor.scrollTop;
      editor.value = this.site.value();
      editor.selectionStart = start;
      editor.selectionEnd = end;
      return editor.scrollTop = scroll;
    };

    TextareaAdapter.prototype.contents = function() {
      return this.editor.val();
    };

    return TextareaAdapter;

  })();

}).call(this);
