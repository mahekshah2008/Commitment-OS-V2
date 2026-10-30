{
  "nbformat": 4,
  "nbformat_minor": 0,
  "metadata": {
    "colab": {
      "provenance": []
    },
    "kernelspec": {
      "name": "python3",
      "display_name": "Python 3"
    },
    "language_info": {
      "name": "python"
    }
  },
  "cells": [
    {
      "cell_type": "markdown",
      "source": [
        "\n",
        "\n",
        "> Connect the NVIDIA model to CommitmentOS\n",
        "\n"
      ],
      "metadata": {
        "id": "gR-h-epauRw0"
      }
    },
    {
      "cell_type": "markdown",
      "source": [
        "nemotron_client.py"
      ],
      "metadata": {
        "id": "ndNb31lTuWMT"
      }
    },
    {
      "cell_type": "code",
      "execution_count": 2,
      "metadata": {
        "colab": {
          "base_uri": "https://localhost:8080/"
        },
        "id": "3Vp1x5F4uOtd",
        "outputId": "02980ea2-c263-4440-fd30-83073f80a570"
      },
      "outputs": [
        {
          "output_type": "stream",
          "name": "stdout",
          "text": [
            "{\n",
            "  \"id\": \"chatcmpl-31d3fc2b\",\n",
            "  \"choices\": [\n",
            "    {\n",
            "      \"finish_reason\": \"stop\",\n",
            "      \"index\": 0,\n",
            "      \"logprobs\": null,\n",
            "      \"message\": {\n",
            "        \"content\": \"Hello! How can I help you today?\",\n",
            "        \"refusal\": null,\n",
            "        \"role\": \"assistant\",\n",
            "        \"annotations\": null,\n",
            "        \"audio\": null,\n",
            "        \"function_call\": null,\n",
            "        \"tool_calls\": null,\n",
            "        \"reasoning\": \"Here's a thinking process:\\n\\n1.  **Analyze User Input**: The user said \\\"Hello\\\".\\n2.  **Identify Intent**: Simple greeting, no complex request.\\n3.  **Determine Response**: Should greet back, be friendly, and offer assistance.\\n4.  **Formulate Response**: \\\"Hello! How can I help you today?\\\" or similar.\\n5.  **Check Constraints**: No specific constraints mentioned. Keep it concise and polite.\\n6.  **Output**: Generate the response.✅\\n\",\n",
            "        \"reasoning_content\": \"Here's a thinking process:\\n\\n1.  **Analyze User Input**: The user said \\\"Hello\\\".\\n2.  **Identify Intent**: Simple greeting, no complex request.\\n3.  **Determine Response**: Should greet back, be friendly, and offer assistance.\\n4.  **Formulate Response**: \\\"Hello! How can I help you today?\\\" or similar.\\n5.  **Check Constraints**: No specific constraints mentioned. Keep it concise and polite.\\n6.  **Output**: Generate the response.✅\\n\"\n",
            "      },\n",
            "      \"stop_reason\": null,\n",
            "      \"token_ids\": null\n",
            "    }\n",
            "  ],\n",
            "  \"created\": 1793345897,\n",
            "  \"model\": \"nvidia/Nemotron-3_5-Lightning\",\n",
            "  \"object\": \"chat.completion\",\n",
            "  \"moderation\": null,\n",
            "  \"service_tier\": null,\n",
            "  \"system_fingerprint\": null,\n",
            "  \"usage\": {\n",
            "    \"completion_tokens\": 120,\n",
            "    \"prompt_tokens\": 17,\n",
            "    \"total_tokens\": 137,\n",
            "    \"completion_tokens_details\": {\n",
            "      \"accepted_prediction_tokens\": null,\n",
            "      \"audio_tokens\": null,\n",
            "      \"reasoning_tokens\": 109,\n",
            "      \"rejected_prediction_tokens\": null\n",
            "    },\n",
            "    \"prompt_tokens_details\": null,\n",
            "    \"prompt_cache_hit_tokens\": 0,\n",
            "    \"prompt_cache_miss_tokens\": 17\n",
            "  },\n",
            "  \"prompt_logprobs\": null,\n",
            "  \"prompt_token_ids\": null,\n",
            "  \"kv_transfer_params\": null,\n",
            "  \"ec_transfer_params\": null\n",
            "}\n"
          ]
        }
      ],
      "source": [
        "import os\n",
        "from openai import OpenAI\n",
        "\n",
        "client = OpenAI(\n",
        "    base_url=\"https://api.tokenfactory.eu-north1.nebius.com/v1/\",\n",
        "    api_key=\"v1.CmQKHHN0YXRpY2tleS1lMDBiZGt0MjdnY3JhdnBkN3oSIXNlcnZpY2VhY2NvdW50LWUwMGR4cXZycWU1cnNtYndtNDIMCPyOkdcGEKHe1NICOgwI95GpogcQwObfyAFAAloDZTAw.AAAAAAAAAAGEnTpc1amTCEB_TarQS5rKxaq2bPzh80mp7mSawKw0QhcJLm-2UgS8dInnGlTjX-H3dwIhBYLIM_-GhR5Hc8IF\"\n",
        ")\n",
        "\n",
        "response = client.chat.completions.create(\n",
        "    model=\"nvidia/Nemotron-3_5-Lightning\",\n",
        "    messages=[{\"role\": \"user\", \"content\": \"Hello\"}]\n",
        ")\n",
        "\n",
        "print(response.to_json())"
      ]
    }
  ]
}