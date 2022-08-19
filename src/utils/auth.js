import store from '@/store'

export function checkLogin() {
  return Cookies.get(TokenKey)
}
