import sys
import io
import time
import argparse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# time.sleep(10)


parser = argparse.ArgumentParser(description='Test for argparse')
parser.add_argument('file', metavar='file', help='file 属性，文件列表', nargs='+')
args = parser.parse_args()


def upload(file):
    print(type(file))
    print(file)
    print('上传结束')

if __name__ == '__main__':
    try:
#         print(args)
        upload(args.file)
    except Exception as e:
        print(e)
