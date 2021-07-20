from biliup.plugins.bili_webup import BiliBili, Data
import os
import sys
import io
import time
import argparse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

parser = argparse.ArgumentParser(description='Test for argparse')
parser.add_argument('file', metavar='file', help='file 属性，文件列表', nargs='+')
args = parser.parse_args()


def upload(file_list):
    file_list = [n for n in file_list if n.endswith('.flv')]

    video = Data()
    try:
        video.title = os.path.basename(file_list[0]).replace('.flv', '')
    except IndexError:
        print('超出索引错误')
        return 0
    video.desc = '冯提莫直播录像'
    video.source = 'https://live.bilibili.com/1314'
    # 设置视频分区,默认为174 生活，其他分区
    video.tid = 174
    video.set_tag(['直播录像', '直播', '冯提莫', '录像', '音乐', '美女'])
    with BiliBili(video) as bili:
        bili.login_by_password("461354358@qq.com", "29HM}diCJU7%")
        for file in file_list:
#             localtime = time.asctime(time.localtime(time.time()))
#             print('localtime'+localtime)
            video_part = bili.upload_file(file)  # 上传视频
            video.videos.append(video_part)  # 添加已经上传的视频
            os.remove(file)  # 删除已经上传的视频
#             localtime = time.asctime(time.localtime(time.time()))
#             print('localtime'+localtime)
        # video.cover = bili.cover_up('/cover_path').replace('http:', '')
        ret = bili.submit()  # 提交视频
#         for file in file_list:
            #        os.remove(file)

        print('上传结束')


if __name__ == '__main__':
    try:
        print('python 开始上传')
        upload(args.file)
    except Exception as e:
        print(e)
