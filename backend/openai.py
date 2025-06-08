from openai import OpenAI
import os
import time

OPENAI_API_KEY = ''
organization_id = 'Group-4'
project_id = 'AI_AGENT'

#client 생성 (OpenAI 모듈로 생성된 인스턴스)
client = OpenAI(api_key= OPENAI_API_KEY,
                organization=organization_id,
                project=project_id
                )


def set_open_params(
    model="gpt-3.5-turbo",
    temperature=0.2,
    max_tokens=500,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0,
):
    """ set openai parameters"""

    openai_params = {}

    openai_params['model'] = model
    openai_params['temperature'] = temperature
    openai_params['max_tokens'] = max_tokens
    openai_params['top_p'] = top_p
    openai_params['frequency_penalty'] = frequency_penalty
    openai_params['presence_penalty'] = presence_penalty
    return openai_params


# error, retry 추가
def get_completion(params, system_message_content, user_prompt_content, verbose=False):
    messages = [
            {"role": "system", "content": system_message_content}, # 시스템 메시지는 대화의 맥락과 모델의 전반적인 행동 방식을 설정하는 데 사용
            {"role": "user", "content": user_prompt_content} ]


    time_start = time.time()
    retry_count = 3
    for i in range(0, retry_count):
        while True:
            try:

                response = client.chat.completions.create(
                    model = params['model'],
                    messages = messages,
                    temperature = params['temperature'],
                    max_tokens = params['max_tokens'],
                    top_p = params['top_p'],
                    frequency_penalty = params['frequency_penalty'],
                    presence_penalty = params['presence_penalty'],
                )

                answer = response.choices[0].message.content
                tokens = response.usage.total_tokens


                time_end = time.time()

                if verbose:
                    print('prompt: %s \n token: %d \n %.1fsec\n\n anwer : \n%s'%(user_prompt_content, tokens, (time_end - time_start), answer))
                return answer

            except Exception as error:
                print(f"API Error: {error}")
                print(f"Retrying {i+1} time(s) in 4 seconds...")

                if i+1 == retry_count:
                    return prompt, None, None
                time.sleep(4)
                continue