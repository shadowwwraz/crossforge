param(
  [string]$Out = "shot.png",
  [int]$ClickX = -1,
  [int]$ClickY = -1,
  [switch]$NoActivate
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class CfWin {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  delegate bool EnumProc(IntPtr h, IntPtr l);

  [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb, IntPtr l);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, int dx, int dy, uint data, int extra);

  public static IntPtr Find(string title, uint[] pids) {
    IntPtr found = IntPtr.Zero;
    EnumWindows((h, l) => {
      uint pid; GetWindowThreadProcessId(h, out pid);
      if (Array.IndexOf(pids, pid) < 0) return true;
      var text = new StringBuilder(256);
      GetWindowTextW(h, text, 256);
      if (text.ToString() == title) { found = h; return false; }
      return true;
    }, IntPtr.Zero);
    return found;
  }

  public static void Click(int x, int y) {
    SetCursorPos(x, y);
    System.Threading.Thread.Sleep(80);
    mouse_event(0x0002, 0, 0, 0, 0);
    System.Threading.Thread.Sleep(60);
    mouse_event(0x0004, 0, 0, 0, 0);
  }
}
"@

$pids = [uint32[]](Get-Process electron -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
$hwnd = [CfWin]::Find('CrossForge', $pids)
if ($hwnd -eq [IntPtr]::Zero) { Write-Output "CrossForge window not found"; exit 1 }

if (-not $NoActivate) {
  if ([CfWin]::IsIconic($hwnd)) {
    [void][CfWin]::ShowWindow($hwnd, 9)   # SW_RESTORE
    Start-Sleep -Milliseconds 500
  }
  [void][CfWin]::SetForegroundWindow($hwnd)
  Start-Sleep -Milliseconds 400
}

$rect = New-Object CfWin+RECT
[void][CfWin]::GetWindowRect($hwnd, [ref]$rect)
$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top
if ($width -lt 200 -or $height -lt 200) {
  Write-Output "window still not restored: ${width}x${height} at ($($rect.Left),$($rect.Top))"
  exit 1
}

if ($ClickX -ge 0 -and $ClickY -ge 0) {
  [CfWin]::Click($rect.Left + $ClickX, $rect.Top + $ClickY)
  Start-Sleep -Milliseconds 700
}

$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($rect.Left, $rect.Top, 0, 0, (New-Object System.Drawing.Size $width, $height))
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "captured ${width}x${height} at ($($rect.Left),$($rect.Top)) -> $Out"
