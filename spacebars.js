var count = 0;
compileAndRender = function (content, data) {
  var name = 'nameless' + count++;
  var compiler = SpacebarsCompiler;

  var compiled = compiler.compile(content);
  var templateFmt = "new Template('%s', function() {var view=this; return %s()})";
  var template = templateFmt.replace("%s", name).replace("%s", compiled);// format(templateFmt, name, compiled);

  return Blaze.toHTMLWithData(eval(template), data);
};
