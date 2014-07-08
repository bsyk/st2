from oslo.config import cfg

from st2actionrunnercontroller import config

STDOUT = 'stdout'
STDERR = 'stderr'


class RunnerContainerService():
    """
        The RunnerContainerService class implements the interface
        that ActionRunner implementations use to access services
        provided by the Action Runner Container.
    """

    def __init__(self, container):
        self._container = container
        self._exit_code = None
        self._output = []
        self._payload = {}

    def report_exit_code(self, code):
        self._exit_code = code

    def report_output(self, stream, output):
        self._output.append((stream, output))

    def report_payload(self, name, value):
        self._payload[name] = value

    def get_logger(self, name):
        from st2common import log as logging
        logging.getLogger(__name__ + '.' + name)

    def get_artifact_working_dir(self):
        return cfg.CONF.action_runner.artifact_working_dir

    def get_artifact_repo_path(self):
        return cfg.CONF.action_runner.artifact_repo_path

    def __str__(self):
        result = []
        result.append('RunnerContainerService@')
        result.append(str(id(self)))
        result.append('(')
        result.append('_container="%s", ' % self._container)
        result.append('_exit_code="%s", ' % self._exit_code)
        result.append('_output="%s", ' % self._output)
        result.append('_payload="%s", ' % self._payload)
        result.append(')')
        return ''.join(result)