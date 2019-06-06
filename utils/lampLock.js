function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getDays(date1 , date2){

  var date1Obj = new Date(date1);
  var date2Obj = new Date(date2);

  var t1 = date1Obj.getTime();
  var t2 = date2Obj.getTime();
  var dateTime = 1000*60*60*24; //每一天的毫秒数
  var minusDays = Math.floor(((t2-t1)/dateTime));//计算出两个日期的天数差
  var days = Math.abs(minusDays);//取绝对值
  return days + 1;
}

module.exports = {
  formatTime: formatTime,
  getDays: getDays
}
