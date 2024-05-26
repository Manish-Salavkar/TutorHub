// caddit\src\utils\utils.js 

// const DateConverter = ({ dateString }) => {
//   const formatUTCDateToIST = (dateString) => {
//     let dateUTC = new Date(dateString);
//     dateUTC = dateUTC.getTime();
//     var dateIST = new Date(dateUTC);
//     dateIST.setHours(dateIST.getHours());
//     dateIST.setMinutes(dateIST.getMinutes());

//     const formattedDate = dateIST.toLocaleString("en-US", {
//       timeZone: 'Asia/Kolkata',
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//     }).replace(/\//g, '-');

//     const parts = formattedDate.split('-');
//     return `${parts[2]}-${parts[0]}-${parts[1]}`;
//   };

//   return formatUTCDateToIST(dateString);
// };

// export default DateConverter;

const DateConverter = ({ dateString }) => {
  const formatUTCDateToIST = (dateString) => {
    let dateUTC = new Date(dateString);
    dateUTC = dateUTC.getTime();
    var dateIST = new Date(dateUTC);
    dateIST.setHours(dateIST.getHours());
    dateIST.setMinutes(dateIST.getMinutes());

    const formattedDate = dateIST.toLocaleString("en-US", {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-');

    const parts = formattedDate.split('-');
    return `${parts[2]}-${parts[0]}-${parts[1]}`;
  };

  return formatUTCDateToIST(dateString);
};

export default DateConverter