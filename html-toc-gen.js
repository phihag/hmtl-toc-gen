#!/usr/bin/env node

(function() {
'use strict';

var fs = require('fs');
var process = require('process');

function gen_toc_line(heading) {
	return '<a class="tocline tocline_' + heading.level + '">' + heading.title + '</a>';
}

function gen_toc(headings) {
	return '<div class="toc">\n' + headings.map(gen_toc_line).join('\n') + '\n</div>';
}

function add_toc(html) {
	var headings = [];
	var curnums = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	html = html.replace(/<h([1-9])(?:\s*id="ch[0-9.]+")?>([^<]*)</g, function(_, hnum, title) {
		var level = parseInt(hnum) - 1;
		for (var i = level + 1;i < curnums.length;i++) {
			curnums[i] = 0;
		}
		curnums[level]++;

		var id = 'ch' + curnums.slice(0, level + 1).join('.');
		headings.push({
			id: id,
			title: title,
		});
		return '<h' + hnum + ' id="' + id + '">' + title + '<';
	});
	var toc = gen_toc(headings);
	html.replace(/(<!--TOC-->)[\s\S]*(<!--\/TOC-->)/, function(_, tocstart, tocend) {
		return tocstart + toc + tocend;
	});
	return html;
}

function main() {
	var args = process.argv.slice(2);

	if (args.length !== 1) {
		console.log('Usage: autogen_toc.js FILE');
		process.exit(1);
	}

	var filename = args[0];
	var tmp_filename = filename + '.tmp';

	var html = fs.readFileSync(filename, {encoding: 'utf8'});
	html = add_toc(html);
	fs.writeFileSync(tmp_filename);
	fs.move(tmp_filename, filename);
}

main();
})();
