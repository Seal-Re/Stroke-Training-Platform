import service from '@/http/request';

// 登录接口
export const LoginAPI = function (data)
{
    return service({
        url: '/login',
        method: 'POST',
        data,
    });
}
