//cl cap2bmp.c /link user32.lib gdi32.lib
#include <windows.h>
#include <winuser.h>
#include <stdio.h>
#include <time.h>

BOOL WINAPI DllMain(HINSTANCE hinstDLL, // DLL モジュールのハンドル
             DWORD     fdwReason,       // 呼び出し理由
             LPVOID    lpvReserved)     // 予約済み
{
    BOOL fResult = FALSE;
    switch (fdwReason) {
        case DLL_PROCESS_ATTACH:        // DLLがプロセスにアタッチされた
            fResult = TRUE;
            break;
        case DLL_THREAD_ATTACH:         // 新しいスレッドが DLLにアタッチした
            break;
        case DLL_PROCESS_DETACH:        // プロセスがDLLからデタッチした
            break;
        case DLL_THREAD_DETACH:         // スレッドがDLLからデタッチした
            break;
        default:
            break;
    }
    return(fResult);
}
void datetime(char *outp){
	time_t nowtime;
	struct tm *ntm;

	time(&nowtime);
	ntm = localtime(&nowtime);

	sprintf(outp, "%04d%02d%02d%02d%02d%02d.bmp",
			1900+ntm->tm_year,
			1+ntm->tm_mon,
			ntm->tm_mday,
			ntm->tm_hour,
			ntm->tm_min,
			ntm->tm_sec
			);
	return;
}

void DrawCursor(HDC hdc)
{
	int        x, y;
	CURSORINFO cursorInfo;
	ICONINFO   iconInfo;

	cursorInfo.cbSize = sizeof(CURSORINFO);
	GetCursorInfo(&cursorInfo);

	GetIconInfo(cursorInfo.hCursor, &iconInfo);

	x = cursorInfo.ptScreenPos.x - iconInfo.xHotspot;
	y = cursorInfo.ptScreenPos.y - iconInfo.yHotspot;
	DrawIcon(hdc, x, y, cursorInfo.hCursor);
}

BOOL WriteBitmap(LPTSTR lpszFileName, int nWidth, int nHeight, LPVOID lpBits)
{
	HANDLE           hFile;
	DWORD            dwResult;
	DWORD            dwSizeImage;
	BITMAPFILEHEADER bmfHeader;
	BITMAPINFOHEADER bmiHeader;

	hFile = CreateFile(lpszFileName, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
	if (hFile == INVALID_HANDLE_VALUE)
		return FALSE;
	
	dwSizeImage = nHeight * ((3 * nWidth + 3) / 4) * 4;

	ZeroMemory(&bmfHeader, sizeof(BITMAPFILEHEADER));
	bmfHeader.bfType    = *(LPWORD)"BM";
	bmfHeader.bfSize    = sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER) + dwSizeImage;
	bmfHeader.bfOffBits = sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER);

	WriteFile(hFile, &bmfHeader, sizeof(BITMAPFILEHEADER), &dwResult, NULL);

	ZeroMemory(&bmiHeader, sizeof(BITMAPINFOHEADER));
	bmiHeader.biSize        = sizeof(BITMAPINFOHEADER);
	bmiHeader.biWidth       = nWidth;
	bmiHeader.biHeight      = nHeight;
	bmiHeader.biPlanes      = 1;
	bmiHeader.biBitCount    = 24;
	bmiHeader.biSizeImage   = dwSizeImage;
	bmiHeader.biCompression = BI_RGB;
	
	WriteFile(hFile, &bmiHeader, sizeof(BITMAPINFOHEADER), &dwResult, NULL);

	WriteFile(hFile, lpBits, dwSizeImage, &dwResult, NULL);

	CloseHandle(hFile);
	
	return TRUE;
}

HBITMAP CreateBackbuffer(int nWidth, int nHeight)
{
	LPVOID           lp;
	BITMAPINFO       bmi;
	BITMAPINFOHEADER bmiHeader;

	ZeroMemory(&bmiHeader, sizeof(BITMAPINFOHEADER));
	bmiHeader.biSize      = sizeof(BITMAPINFOHEADER);
	bmiHeader.biWidth     = nWidth;
	bmiHeader.biHeight    = nHeight;
	bmiHeader.biPlanes    = 1;
	bmiHeader.biBitCount  = 24;

	bmi.bmiHeader = bmiHeader;

	return CreateDIBSection(NULL, (LPBITMAPINFO)&bmi, DIB_RGB_COLORS, &lp, NULL, 0);
}


__declspec(dllexport) int WINAPI Capture(char *outdata){
	HDC     hdc;
	HWND    hwndDesk;
	RECT    rc;
	BITMAP  bm;
	HBITMAP hbmp;
	HBITMAP hbmpPrev;
	char	savefile[256];

	hwndDesk = GetDesktopWindow();
	GetWindowRect(hwndDesk, &rc);

	hdc = CreateCompatibleDC(NULL);
	hbmp = CreateBackbuffer(rc.right/1.5, rc.bottom/1.5);
	hbmpPrev = (HBITMAP)SelectObject(hdc, hbmp);

//	BitBlt(hdc, 0, 0, rc.right, rc.bottom, GetWindowDC(hwndDesk), 0, 0, SRCCOPY);
	StretchBlt(hdc, 0, 0, rc.right/1.5, rc.bottom/1.5, GetWindowDC(hwndDesk), 0, 0, rc.right, rc.bottom, SRCCOPY);
	DrawCursor(hdc);

	GetObject(hbmp, sizeof(BITMAP), &bm);
	datetime(savefile);
//	if (WriteBitmap(TEXT("capture.bmp"), rc.right, rc.bottom, bm.bmBits))
	if (WriteBitmap(savefile, rc.right/1.5, rc.bottom/1.5, bm.bmBits))
		MessageBox(NULL, TEXT("ファイルを作成しました。"), TEXT("OK"), MB_OK);
	else
		MessageBox(NULL, TEXT("ファイルの作成に失敗しました。"), NULL, MB_ICONWARNING);

	SelectObject(hdc, hbmpPrev);
	DeleteObject(hbmp);
	DeleteDC(hdc);

	return 0;

}	
