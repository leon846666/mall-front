import http from '@/utils/httpRequest.js'
export function policy() {
   return  new Promise((resolve,reject)=>{
        http({
            url: http.adornUrl("/third/aws/upload"),
            method: "post",
            params: http.adornParams({})
        }).then(({ data }) => {
            resolve(data);
        })
    });
}