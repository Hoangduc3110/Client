import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';
import { https } from '../../services/axiosClient';
import { localStorageService } from '../../services/localStorageService';
import {openNotificationIcon} from '../../Components/NotificationIcon/NotificationIcon'
const initialState = {
  accessToken: null,
  isLoggedIn: !!localStorageService.get('USER'),
  registerSuccess: false,
  isRegisterAccountSuccess: false,
};

//LOGIN
export const loginUser = createAsyncThunk('auth/loginUser', async (user, thunkAPI) => {
    try {
        const res = await https.post(`/api/v1/auth/login`, user);
    localStorageService.set('accessToken', res.data.token);
    localStorageService.set('USER', res.data);
    openNotificationIcon('success', 'Success', 'Login Success!');
    console.log(res)
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      message.error('Forbidden: Access Denied');
    } else if (error.response && error.response.status === 401) {
      message.error('Unauthorized: Invalid credentials');
    } else {
      message.error('Login Failed');
    }
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

//LOGOUT
export const logoutUser = createAsyncThunk('auth/logoutUser', async (user, thunkAPI) => {
  try {
    localStorageService.remove('USER')
    localStorageService.remove('accessToken')
    openNotificationIcon('success', 'Success', 'Logout Success!');
    return user;
  } catch (error) {
    openNotificationIcon('erorr', 'Erorr', 'Logout Erorr!');
  }
});
export const registerUser = createAsyncThunk('auth/registerUser', async (infor, thunkAPI) => {
  try {
    const res = await https.post('/api/v1/auth/register-customer', infor);
    message.success('Register success');
    return res.data;
  } catch (error) {
    message.error('Login fail');
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

//REGISTER

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      return {
        ...state,
        isLoading: false,
      };
    },
  },
  extraReducers: (builder) => {
    return builder
      .addCase(loginUser.pending, (state) => {
        return {
          ...state,
          isLoading: true,
        };
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        return {
          ...state,
          isLoading: false,
          accessToken: payload.token,
          isLoggedIn: !!payload,
        };
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        return {
          ...state,
          isLoading: false,
          accessToken: payload.token,
          isLoggedIn: false,
        };
      })
      .addCase(logoutUser.pending, (state) => {
        return {
          ...state,
          isLoading: true,
        };
      })
      .addCase(logoutUser.fulfilled, (state, { payload }) => {
        return {
          ...state,
          isLoading: false,
          isLoggedIn: false,
        };
      })
      .addCase(registerUser.pending, (state) => {
        return {
          ...state,
          isLoading: true,
        };
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        return {
          ...state,
          isLoading: false,
          registerSuccess: true,
        };
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        return {
          ...state,
          isLoading: false,
          registerSuccess: false,
          isRegisterAccountSuccess: true,
        };
      });
  },
});
// Action creators are generated for each case reducer function
export const { reset } = authSlice.actions;

export default authSlice.reducer;
