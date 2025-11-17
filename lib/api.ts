export const authAPI = {
async signup(name: string,email:string,password:string){
    const response = await fetch('/api/auth/signup',{
       method:'POST',
       headers: {
        'Content-type':'application/json',
       },
       body:JSON.stringify({name,email,password}),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error (data.error || 'signup failed')
    }

    return data;
},

};