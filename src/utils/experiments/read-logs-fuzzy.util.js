
const fs = require('fs');
const es = require('event-stream');

const DEFAULT_LINES_PER_PAGE = 30;
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_SORT_ORDER = 'desc';


var readLogsFuzzy = function (params) {
  let { filePath, sort_order=DEFAULT_SORT_ORDER, page_number=DEFAULT_PAGE_NUMBER, lines_per_page=DEFAULT_LINES_PER_PAGE} = params;
  return new Promise((resolve, reject) => {
    const fileSize =  fs.statSync(filePath).size
    console.log('Filesize : ', fileSize)
    let chunk = '';
    let options = {};
    let line_cursor = 0;
    if(sort_order === 'asc'){
      line_cursor = ((page_number - 1) * lines_per_page) + 1
      options.start = Math.min(fileSize, line_cursor * 200);
      options.end = Math.min(fileSize, options.start + (lines_per_page * 200));
    }
    else{
      line_cursor = ((page_number - 1) * lines_per_page) + 1
      options.start = Math.max(0, fileSize - (line_cursor * 200));
      options.end = Math.min(fileSize, options.start + (lines_per_page * 200));
    }
    console.log('Sort Order : ', sort_order)
    console.log('Line Cursor : ', line_cursor)
    console.log('Read Stream Options : ',options)
    const fd = fs.createReadStream(filePath, options);
    fd.on('data', function(data) { chunk += data.toString(); });
    fd.on('error', reject)
    fd.on('end', function() {
      chunk = chunk.split('\n')
      const lines_limit = Math.min(chunk.length, lines_per_page);
      if(sort_order === 'asc'){
        chunk = chunk.slice(0,(lines_limit+1));
      }
      else{
        chunk = chunk.slice(-(lines_limit+1));
      }
      chunk.pop();
      resolve(chunk);
    });
  })
};

async function test(){
  console.time('Performance Fuzzy')
  const logs = await readLogsFuzzy({filePath: '/home/ubuntu/.pm2/logs/admin-service-out.log', page_number: 100, lines_per_page: 100, sort_order:'asc'})
  console.timeEnd('Performance Fuzzy')
  console.log('Output Lines : ',logs.length)
}

module.exports =  { readLogsFuzzy }