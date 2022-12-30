import useSm4Store from '@/store/modules/sm4'


export function encrypt(val) {
    return useSm4Store().encrypt(val)
}

export function decrypt(val) {
    return useSm4Store().decrypt(val)
}
