export const getCookie = (name:string):string => {
    let cookieValue = '';
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(`${name}=`)) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}

export const fetchData = async (url: string, errorMessage: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(errorMessage);
    }
    return await response.json();
};