import userStore from "../store/modules/user"


export async function authenticated() {
    const store = userStore()
    if (store.status === -1) {
        await store.getInfo()
    }
    return store.status
}

export function getToken() {
  return ""
}

export function setToken(token) {
}

export function removeToken() {
}
