import queue
from threading import Thread
from queue import Queue


class WorkerThread(Thread):
    def __init__(self, *args, **kwargs):
        Thread.__init__(self, *args, **kwargs)
        self.input_queue = Queue()

    def send(self, item):
        self.input_queue.put(item)

    def close(self):
        self.input_queue.put(None)
        self.input_queue.join()

    def run(self):
        while True:
            item = self.input_queue.get()
            if item is None:
                break
            # 实际开发中，此处应该使用有用的工作代替
            # uploader.upload()  # 延时线程，x秒以后执行go函数，执行一次，
            print('run')
        # 完成，指示收到和返回哨兵
        self.input_queue.task_done()
        return


w = WorkerThread()
w.start()


w.send(1)
w.send(1)
w.send(1)
w.send(1)
w.send(1)
w.close()
