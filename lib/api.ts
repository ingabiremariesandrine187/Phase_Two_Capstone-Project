export const authAPI = {
async signup(name: string,email:string,password:string){
    const response = await fetch('/api/auth/signup',{
       method:'POST',
       headers: {
        'Content-Type':'application/json',
       },
       body:JSON.stringify({name,email,password}),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error (data.error || 'signup failed')
    }

    return data;
},

async getProfile() {
    const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
    }

    return data;
},

async updateProfile(name?: string, avatar?: string) {
    const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, avatar }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
    }

    return data;
},

};