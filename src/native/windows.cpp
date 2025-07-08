#include <napi.h>
#include <windows.h>

Napi::Boolean DisableResizeMaximize(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected HWND pointer").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    HWND hwnd = (HWND)(uintptr_t)info[0].As<Napi::Number>().Int64Value();

    LONG style = GetWindowLong(hwnd, GWL_STYLE);
    style &= ~WS_MAXIMIZEBOX;
    style &= ~WS_SIZEBOX;
    SetWindowLong(hwnd, GWL_STYLE, style);

    SetWindowPos(hwnd, NULL, 0, 0, 0, 0,
                 SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED);

    return Napi::Boolean::New(env, true);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("disableResizeMaximize", Napi::Function::New(env, DisableResizeMaximize));
    return exports;
}

NODE_API_MODULE(addon, Init)
