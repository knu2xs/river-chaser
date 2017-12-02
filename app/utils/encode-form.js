export default function encodeForm (payload) {
  let formData = new FormData();
  for (let key in payload){
    formData.append(key, payload[key]);
  }
  return formData;
}
